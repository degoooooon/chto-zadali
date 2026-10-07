// Загружает контуры суши и рек, собранные скриптом tools/build-map.mjs.

const isPath = (value) => typeof value === 'string' && value.startsWith('M');

const isLabel = (label) =>
  typeof label?.text === 'string' &&
  Number.isFinite(label.lon) &&
  Number.isFinite(label.lat) &&
  Number.isFinite(label.minZoom);

// Тексты для посетителя. Что именно сломалось, уходит в консоль:
// ребёнку слова «npm run build:map» ничего не скажут
const NO_CONNECTION = 'Карта не загрузилась: нет связи. Проверь интернет и обнови страницу.';
const BROKEN_MAP = 'Карта не загрузилась. Попробуй обновить страницу.';

// Файл наш, но его пересобирают руками. Если сборка оборвалась на середине,
// лучше сразу сказать «карта битая», чем молча показать пустое море
const assertMapData = (data, url) => {
  const isValid =
    isPath(data?.land) &&
    isPath(data?.rivers?.major) &&
    isPath(data?.rivers?.minor) &&
    Array.isArray(data?.riverLabels) &&
    data.riverLabels.every(isLabel);

  if (!isValid) {
    console.error(`${url} не той формы. Пересобери: npm run build:map`);
    throw new Error(BROKEN_MAP);
  }
};

export const loadMap = async (url) => {
  let response;

  try {
    response = await fetch(url);
  } catch {
    // Сюда попадаем, когда пропала сеть или сервер не отвечает.
    // Родное сообщение браузера («Failed to fetch») школьнику ничего не скажет
    throw new Error(NO_CONNECTION);
  }

  // fetch не бросает ошибку на 404, без этой проверки дальше полетит
  // невнятное «Unexpected token» из разбора страницы ошибки как JSON
  if (!response.ok) {
    console.error(`${url}: ответ сервера ${response.status}`);
    throw new Error(BROKEN_MAP);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    console.error(`${url} не разбирается как JSON. Пересобери: npm run build:map`);
    throw new Error(BROKEN_MAP);
  }

  assertMapData(data, url);

  return data;
};
