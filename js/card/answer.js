// Блок «Как рассказать на оценку». Умеет два рассказа:
// об одном событии — чем выше оценка, тем больше частей в рассказе;
// о параграфе целиком — вступление, все события по порядку, вывод.
// На экране всегда рассказ на одну выбранную оценку, целиком.

import { createElement } from '../dom.js';
import { createTermFinder } from '../text/find-terms.js';
import { formatWhen } from '../time/when.js';
import { createTippedText, enableWordTips } from './word-tip.js';

export const GRADES = [3, 4, 5];
export const DEFAULT_GRADE = 5;

// Части рассказа о событии по нарастающей. key — поле из answers.js класса (js/data/class-5/answers.js).
// grade — с какой оценки часть входит в рассказ. В подписи оценки нет:
// с ней на вкладке «5» стояло «На «3»» и «На «4»», и рассказ на «5» читался
// как три чужих рассказа подряд
const STEPS = [
  { grade: 3, key: 'basic', label: 'Что, где и когда' },
  { grade: 4, key: 'details', label: 'Кто участвовал и как всё было' },
  { grade: 5, key: 'depth', label: 'Почему так случилось и к чему привело' },
];

const EVENT_TITLE = 'Как рассказать на оценку';
const PARAGRAPH_TITLE = 'Как пересказать параграф на оценку';

const createBlock = (label, ...children) => {
  const block = createElement('div', 'answer__step');

  block.append(createElement('p', 'answer__step-label', label), ...children);

  return block;
};

// Текст одного рассказа со словами-подсказками. На рассказ один список
// «уже подчёркнуто»: слово выделяем при первом упоминании, а не в каждой
// части. noTips — слова, которые в этом рассказе не подчёркиваем вовсе
// (см. js/data/class-5/answers.js): кладём их в тот же список заранее
const createWriter = (findTerms, noTips = []) => {
  const seen = new Set(noTips);

  return (text) => {
    const paragraph = createElement('p', 'answer__step-text');

    paragraph.append(...createTippedText(findTerms(text, seen)));

    return paragraph;
  };
};

// То, без чего «пятёрку» не ставят, даже если рассказ полный
const createExtras = (mapHint, terms) => {
  const list = createElement('ul', 'answer__extra-list');
  const children = [list];

  list.append(createElement('li', 'answer__extra', mapHint));

  if (terms.length) {
    const glossary = createElement('dl', 'answer__terms');

    list.append(createElement('li', 'answer__extra', 'Объясни слова своими словами:'));
    for (const [term, meaning] of terms) {
      glossary.append(
        createElement('dt', 'answer__term', term),
        createElement('dd', 'answer__meaning', meaning),
      );
    }
    children.push(glossary);
  }

  return createBlock('И ещё на «5»', ...children);
};

const renderEvent = (event, grade, findTerms) => {
  const write = createWriter(findTerms, event.answer.noTips);
  const blocks = STEPS.filter((step) => step.grade <= grade).map((step) =>
    createBlock(step.label, write(event.answer[step.key])),
  );

  if (grade === 5) {
    blocks.push(createExtras('Покажи место на карте и назови, где это сейчас.', event.answer.terms ?? []));
  }

  return blocks;
};

// Рассказ о событии внутри пересказа параграфа: чем выше оценка, тем больше
// частей идёт подряд одним абзацем
const joinParts = (answer, grade) =>
  STEPS.filter((step) => step.grade <= grade)
    .map((step) => answer[step.key])
    .join(' ');

const renderParagraph = ({ retelling, events }, grade, findTerms, onPick) => {
  const write = createWriter(findTerms, retelling.noTips);
  const list = createElement('ol', 'answer__events');

  for (const event of events) {
    const item = createElement('li', 'answer__event');
    const heading = createElement('button', 'answer__event-link');

    heading.type = 'button';
    heading.append(
      createElement('span', `answer__event-mark era era--${event.era}`),
      createElement('span', 'answer__event-when', formatWhen(event.when)),
      createElement('span', 'answer__event-title', event.title),
    );
    heading.addEventListener('click', () => onPick(event.id));
    // У каждого события свой рассказ и свой счёт первых упоминаний:
    // до пятого события в списке слово из вступления уже забылось
    item.append(heading, createWriter(findTerms, event.answer.noTips)(joinParts(event.answer, grade)));
    list.append(item);
  }

  // В параграфе без дат событий нет: рассказ на «3» — это само вступление
  const blocks = events.length
    ? [
        createBlock('Начни так', write(retelling.lead)),
        createBlock(events.length > 1 ? 'Потом события по порядку' : 'Потом главное событие', list),
      ]
    : [createBlock('О чём параграф', write(retelling.lead))];

  if (grade >= 4 && retelling.more) {
    blocks.push(
      createBlock(events.length ? 'Что ещё есть в параграфе' : 'Подробности', write(retelling.more)),
    );
  }
  if (grade === 5 && retelling.deeper) {
    blocks.push(createBlock('Ещё подробности', write(retelling.deeper)));
  }
  if (grade === 5) {
    // Слова берём и у параграфа, и у его событий. Map убирает повторы:
    // один и тот же термин встречается у нескольких событий
    const terms = new Map([
      ...(retelling.terms ?? []),
      ...events.flatMap((event) => event.answer.terms ?? []),
    ]);

    blocks.push(
      createBlock('Закончи выводом', write(retelling.summary)),
      createExtras(
        events.length ? 'Покажи на карте все места параграфа.' : 'Покажи на карте страну, о которой рассказываешь.',
        [...terms],
      ),
    );
  }

  return blocks;
};

// glossary — словарь подсказок из js/data/prepare-glossary.js
export const createAnswer = ({ root, glossary, onGrade, onPick }) => {
  const title = root.querySelector('.answer__title');
  const content = root.querySelector('.answer__content');
  const buttons = [...root.querySelectorAll('.answer__grade')];
  const findTerms = createTermFinder(glossary);
  const tips = enableWordTips(content);

  root.addEventListener('click', (event) => {
    const button = event.target.closest('.answer__grade');
    const grade = Number(button?.dataset.grade);

    // Оценку читаем из разметки, поэтому сверяем со списком:
    // опечатка в data-grade иначе спрячет весь рассказ
    if (GRADES.includes(grade)) {
      onGrade(grade);
    }
  });

  // event — открыто одно событие; paragraph — открыт параграф целиком:
  // { retelling, events }. Ни того ни другого — блок скрыт
  const update = ({ event, paragraph, grade }) => {
    // До перерисовки: открытая подсказка лежит в тексте, который сейчас заменят
    tips.close();
    root.hidden = !event && !paragraph;

    if (root.hidden) {
      return;
    }

    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.grade) === grade));
    }

    title.textContent = event ? EVENT_TITLE : PARAGRAPH_TITLE;
    content.replaceChildren(
      ...(event ? renderEvent(event, grade, findTerms) : renderParagraph(paragraph, grade, findTerms, onPick)),
    );
  };

  return { update };
};
