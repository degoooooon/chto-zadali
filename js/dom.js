// Создание элементов. Текст всегда кладём через textContent:
// названия и описания приходят из файлов данных, и угловая скобка
// в заголовке не должна превратиться в разметку.

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const createElement = (tag, className, text) => {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }

  return node;
};

export const createSvgElement = (tag, className, attributes = {}) => {
  const node = document.createElementNS(SVG_NAMESPACE, tag);

  if (className) {
    node.setAttribute('class', className);
  }
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }

  return node;
};
