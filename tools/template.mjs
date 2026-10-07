// Подстановка значений в шаблон страницы. Общая для страниц учебников
// и страниц выбора класса и предмета (tools/build-pages.mjs).

// Тексты наши, но в них бывают кавычки и угловые скобки, а вставляются они
// и в текст, и в атрибуты. Без экранирования кавычка в описании закроет content=""
export const escapeHtml = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const fillTemplate = (template, values) => {
  const used = new Set();
  const html = template.replaceAll(/\{\{(\w+)\}\}/g, (match, name) => {
    // Опечатка в имени вставки иначе уедет в страницу как «undefined»
    if (!Object.hasOwn(values, name)) {
      throw new Error(`В шаблоне есть вставка {{${name}}}, а значения для неё нет`);
    }
    used.add(name);

    return values[name];
  });
  const unused = Object.keys(values).filter((name) => !used.has(name));

  if (unused.length) {
    throw new Error(`Значения без места в шаблоне: ${unused.join(', ')}`);
  }

  return html;
};
