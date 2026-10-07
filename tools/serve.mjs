// Локальный сервер для разработки. Запуск: npm start
//
// Зачем свой, а не python -m http.server: тот не запрещает кеширование,
// и браузер по несколько минут отдаёт старые модули. Поправил файл,
// обновил страницу, а в ней прежний код.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
// Порт записан ещё в двух местах: .claude/launch.json и в тексте-подсказке
// в js/boot-check.js. Меняешь здесь — поправь и там
const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const send = (response, status, body = '', type = 'text/plain; charset=utf-8') => {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(body);
};

const toFilePath = (url) => {
  const { pathname } = new URL(url, 'http://localhost');
  const decoded = decodeURIComponent(pathname);
  const filePath = resolve(ROOT, `.${decoded.endsWith('/') ? `${decoded}index.html` : decoded}`);
  const isInsideRoot = filePath.startsWith(ROOT + sep);
  // Служебные папки (.claude, .git) наружу не отдаём
  const hasHiddenPart = filePath.slice(ROOT.length).split(sep).some((part) => part.startsWith('.'));

  // Адрес вида /%2e%2e/%2e%2e/etc/passwd после раскодирования выходит
  // из папки проекта. Без проверки сервер отдал бы любой файл с диска
  return isInsideRoot && !hasHiddenPart ? filePath : null;
};

const server = createServer(async (request, response) => {
  let filePath = null;

  try {
    filePath = toFilePath(request.url);
  } catch {
    // Битый адрес (%-последовательность, которую нельзя раскодировать)
    send(response, 400, 'Неверный адрес');
    return;
  }

  if (!filePath) {
    send(response, 403, 'Нет доступа');
    return;
  }

  try {
    send(response, 200, await readFile(filePath), TYPES[extname(filePath)] ?? 'application/octet-stream');
  } catch {
    send(response, 404, 'Файл не найден');
  }
});

// 127.0.0.1, а не все адреса: сервер виден только с этого компьютера,
// из общей сети Wi-Fi до него не достучаться
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Карта открыта: http://localhost:${PORT}`);
});
