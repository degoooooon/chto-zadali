// Экран «Что задали?»: с него начинают. Ребёнку говорят «§ 28»,
// а не «найди Марафон на карте», поэтому главный вход — номер параграфа.
// Кто номера не помнит, выбирает из списка по разделам.

import { createElement } from '../dom.js';
import { formatParagraphNumber } from '../text/paragraph-number.js';
import { EVENT_FORMS, plural } from '../text/plural.js';

// Номера, которые покрывает параграф: у «6-7» это 6 и 7
const getNumbers = (paragraph) => paragraph.id.split('-').map(Number);

// У параграфа без событий на карте пересказ всё равно есть,
// поэтому строка такая же кнопка, только с пометкой «без дат»
const createRow = (paragraph, count, onChoose) => {
  const row = createElement('button', 'chooser__row');

  row.type = 'button';
  row.addEventListener('click', () => onChoose(paragraph.id));
  row.append(
    createElement('span', 'chooser__number', formatParagraphNumber(paragraph.id)),
    createElement('span', 'chooser__name', paragraph.title),
    createElement('span', 'chooser__count', count ? `${count} ${plural(count, EVENT_FORMS)}` : 'без дат'),
  );

  return row;
};

// counts — сколько событий на карте у параграфа: Map «id параграфа → число»
export const createChooser = ({ root, eras, paragraphs, counts, onChoose, onShowAll }) => {
  const groups = root.querySelector('.chooser__groups');
  const form = root.querySelector('.chooser__form');
  const input = root.querySelector('.chooser__input');
  const message = root.querySelector('.chooser__message');
  const lastNumber = Math.max(...paragraphs.flatMap(getNumbers));

  for (const era of eras) {
    const own = paragraphs.filter((item) => item.era === era.id);
    // Раздел свёрнут: шесть строк помещаются на экране телефона,
    // а пятьдесят два параграфа подряд — это четыре экрана прокрутки
    const group = createElement('details', 'chooser__group');
    const heading = createElement('summary', `chooser__era era era--${era.id}`);
    const list = createElement('ul', 'chooser__list');
    const range = `§ ${getNumbers(own[0])[0]}–${getNumbers(own.at(-1)).at(-1)}`;

    heading.append(
      createElement('span', 'chooser__era-mark'),
      createElement('span', 'chooser__era-title', era.title),
      createElement('span', 'chooser__era-range', range),
    );

    for (const paragraph of own) {
      const item = createElement('li', 'chooser__item');

      item.append(createRow(paragraph, counts.get(paragraph.id) ?? 0, onChoose));
      list.append(item);
    }

    group.append(heading, list);
    groups.append(group);
  }

  form.addEventListener('submit', (event) => {
    // Иначе браузер отправит форму и перезагрузит страницу
    event.preventDefault();

    // В поле может оказаться что угодно: «28», «§28», «двадцать», пусто.
    // Берём только цифры и сверяем с настоящими номерами параграфов
    const number = Number(input.value.replace(/\D/g, '').slice(0, 3));
    const paragraph = paragraphs.find((item) => getNumbers(item).includes(number));

    if (!paragraph) {
      message.textContent = `Напиши номер параграфа цифрами, от 1 до ${lastNumber}.`;
      return;
    }
    message.textContent = '';
    input.value = '';
    onChoose(paragraph.id);
  });

  root.querySelector('.chooser__all').addEventListener('click', onShowAll);

  return {
    update: ({ isVisible }) => {
      root.hidden = !isVisible;
    },
  };
};
