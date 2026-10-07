// Слово с подсказкой. В тексте рассказа оно подчёркнуто точками,
// по нажатию под ним открывается объяснение из словаря.

import { createElement } from '../dom.js';

// Что показать под словом. Связь держим здесь, а не в data-атрибутах:
// объяснение не приходится читать обратно из разметки и проверять заново
const entries = new WeakMap();

// parts — куски текста из js/text/find-terms.js. Обычный текст остаётся
// текстом, слово из словаря становится кнопкой.
//
// Кнопка здесь — span с ролью, а не <button>. Настоящая кнопка в строке
// неделима, и браузер переносит строку между ней и знаком после неё:
// запятая или точка оказывается в начале следующей строки. Span переносится
// как обычный текст. Взамен сами даём ему роль, место в обходе по Tab
// и нажатие с клавиатуры (см. enableWordTips)
export const createTippedText = (parts) =>
  parts.map(({ text, term, meaning }) => {
    if (!term) {
      return text;
    }

    const tip = createElement('span', 'word-tip');
    const word = createElement('span', 'word-tip__word', text);

    word.setAttribute('role', 'button');
    word.tabIndex = 0;
    word.setAttribute('aria-expanded', 'false');
    entries.set(word, { term, meaning });
    tip.append(word);

    return tip;
  });

// Подсказка стоит под левым краем слова. Если слово у правого края колонки,
// она вылезла бы за карточку, поэтому сдвигаем её влево ровно на столько,
// на сколько она не поместилась
const place = (note, frame) => {
  const overflow = note.getBoundingClientRect().right - frame.getBoundingClientRect().right;

  if (overflow > 0) {
    note.style.left = `${-overflow}px`;
  }
};

// root — блок, внутри которого лежит текст с подсказками. Открыта всегда
// одна подсказка: две перекрыли бы друг друга и текст под собой
export const enableWordTips = (root) => {
  let opened = null;

  const close = () => {
    if (!opened) {
      return;
    }

    opened.note.remove();
    opened.word.setAttribute('aria-expanded', 'false');
    opened = null;
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('keydown', onEscape);
  };

  // Нажатие мимо подсказки её закрывает. Слушаем pointerup, а не pointerdown:
  // с pointerdown начинается и прокрутка пальцем, и подсказка исчезала бы,
  // едва человек потянул страницу, чтобы её дочитать
  const onPointerUp = (event) => {
    if (!opened.word.parentElement.contains(event.target)) {
      close();
    }
  };

  const onEscape = (event) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  const open = (word) => {
    const { term, meaning } = entries.get(word);
    const note = createElement('span', 'word-tip__note');

    // В тексте слово стоит в падеже («номов»), а объясняем его начальную
    // форму («ном»): её и спросит учитель
    note.append(createElement('span', 'word-tip__term', term), createElement('span', 'word-tip__meaning', meaning));
    word.after(note);
    word.setAttribute('aria-expanded', 'true');
    opened = { word, note };
    place(note, root);
    // Слово в последней видимой строке: подсказка открылась бы за краем экрана
    note.scrollIntoView({ block: 'nearest' });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('keydown', onEscape);
  };

  const toggle = (word) => {
    const wasOpened = opened?.word === word;

    close();
    if (!wasOpened) {
      open(word);
    }
  };

  const findWord = (target) => {
    const word = target.closest('.word-tip__word');

    return word && entries.has(word) ? word : null;
  };

  root.addEventListener('click', (event) => {
    const word = findWord(event.target);

    if (word) {
      toggle(word);
    }
  });

  // У span нет своего нажатия с клавиатуры, в отличие от <button>
  root.addEventListener('keydown', (event) => {
    const word = (event.key === 'Enter' || event.key === ' ') && findWord(event.target);

    if (word) {
      // Пробел иначе прокрутит страницу на экран вниз
      event.preventDefault();
      toggle(word);
    }
  });

  // close нужен снаружи: когда текст перерисовывают, открытая подсказка
  // исчезает вместе с ним, а слушатели на документе остались бы висеть
  return { close };
};
