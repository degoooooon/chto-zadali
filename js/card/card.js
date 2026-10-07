// Карточка события: отвечает на два вопроса, «когда?» и «где?»,
// и показывает, к какому параграфу учебника событие относится.

import { createElement } from '../dom.js';
import { formatParagraphNumber } from '../text/paragraph-number.js';
import { EVENT_FORMS, plural } from '../text/plural.js';
import { formatCenturyOf, formatWhen, isDated } from '../time/when.js';

// Сколько событий одного места ещё удобно листать по кругу и показывать
// списком под карточкой. Если их больше, место открывается отдельно, одним
// списком. В Риме 5 класса событий шестнадцать, в Москве 7 класса —
// шестьдесят четыре: нажимать на точку по кругу столько раз никто не станет.
// Этим же числом пользуется js/app.js, когда решает, что делать по нажатию
// на точку карты
export const MANY_EVENTS = 8;

const createFact = (question, answer, detail) => {
  const fact = createElement('div', 'card__fact');

  fact.append(
    createElement('dt', 'card__question', question),
    createElement('dd', 'card__answer', answer),
  );
  if (detail) {
    fact.append(createElement('dd', 'card__detail', detail));
  }

  return fact;
};

const createButton = (className, text, onClick) => {
  const button = createElement('button', className, text);

  button.type = 'button';
  button.addEventListener('click', onClick);

  return button;
};

export const createCard = ({
  root,
  places,
  eraTitles,
  paragraphTitles,
  onPick,
  onStep,
  onLeave,
  onBackToParagraph,
  onToggleParagraph,
  onOpenPlace,
}) => {
  const body = root.querySelector('.card__body');
  const after = root.querySelector('.card__after');
  const nav = root.querySelector('.card__nav');
  const back = root.querySelector('.card__step--back');
  const forward = root.querySelector('.card__step--forward');
  const counter = root.querySelector('.card__counter');

  back.addEventListener('click', () => onStep(-1));
  forward.addEventListener('click', () => onStep(1));

  // Список событий со ссылками. current — событие, которое сейчас открыто:
  // оно в списке есть, но не кнопкой, а отметкой «ты здесь»
  const createEventList = (title, events, current) => {
    const section = createElement('div', 'card__neighbours');
    const list = createElement('ul', 'card__neighbour-list');

    for (const event of events) {
      const item = createElement('li', 'card__neighbour');
      const isCurrent = event === current;
      const link = createElement(isCurrent ? 'div' : 'button', 'card__neighbour-link');

      if (isCurrent) {
        link.classList.add('card__neighbour-link--current');
        link.setAttribute('aria-current', 'true');
      } else {
        link.type = 'button';
        link.addEventListener('click', () => onPick(event.id));
      }

      link.append(
        createElement('span', `card__neighbour-mark era era--${event.era}`),
        createElement('span', 'card__neighbour-when', formatWhen(event.when)),
        createElement('span', 'card__neighbour-title', event.title),
      );
      item.append(link);
      list.append(item);
    }

    section.append(createElement('h3', 'card__neighbours-title', title), list);

    return section;
  };

  const renderEvent = (event, events, allEvents, isParagraphMode) => {
    const place = places[event.place];
    const era = createElement('p', `card__era era era--${event.era}`);
    const facts = createElement('dl', 'card__facts');
    const paragraphLabel = `${formatParagraphNumber(event.paragraph)}. ${paragraphTitles.get(event.paragraph)}`;
    const title = createElement('h2', 'card__title', event.title);

    // tabindex="-1": после выбора параграфа сюда переносим фокус с клавиатуры,
    // иначе он остаётся на исчезнувшей строке списка и теряется
    title.tabIndex = -1;
    era.append(createElement('span', 'card__era-mark'), eraTitles.get(event.era));
    facts.append(
      createFact('Когда?', formatWhen(event.when), formatCenturyOf(event.when)),
      createFact('Где?', place.name, `сейчас: ${place.now}`),
    );

    body.replaceChildren(
      // Из события внутри параграфа возвращаемся к пересказу параграфа,
      // а не сразу к общему списку: человек готовит один параграф
      isParagraphMode
        ? createButton('card__back', '← К пересказу параграфа', onBackToParagraph)
        : createButton('card__back', '← Все параграфы', onLeave),
      era,
      createElement('p', 'card__paragraph', paragraphLabel),
      title,
      facts,
    );

    const inParagraph = allEvents.filter((item) => item.paragraph === event.paragraph);
    const samePlace = allEvents.filter(
      (item) => item.place === event.place && item.paragraph !== event.paragraph,
    );
    const blocks = [];

    if (inParagraph.length > 1) {
      blocks.push(createEventList('В этом параграфе', inParagraph, event));
    }
    blocks.push(
      createButton(
        'card__mode',
        isParagraphMode ? 'Показать на карте все события' : 'Оставить на карте только этот параграф',
        onToggleParagraph,
      ),
    );
    // В режиме параграфа чужих событий на карте нет, и список «Здесь же»
    // вёл бы к точкам, которых человек не видит
    if (!isParagraphMode && samePlace.length > MANY_EVENTS) {
      // Список на полсотни строк под каждым московским событием никто
      // не дочитает. Вместо него — кнопка: то же место одним списком
      const atPlace = events.filter((item) => item.place === event.place).length;

      blocks.push(
        createButton('card__mode', `${place.name}: все ${atPlace} ${plural(atPlace, EVENT_FORMS)}`, () =>
          onOpenPlace(event.place),
        ),
      );
    } else if (!isParagraphMode && samePlace.length) {
      blocks.push(createEventList('Здесь же в другое время', samePlace, event));
    }

    after.replaceChildren(...blocks);
  };

  // Открыт параграф целиком: в карточке только его шапка,
  // сам пересказ рисует блок «Как пересказать параграф» (js/card/answer.js)
  const renderParagraph = ({ id, era: eraId, hasEvents }) => {
    const era = createElement('p', `card__era era era--${eraId}`);
    const title = createElement('h2', 'card__title', `${formatParagraphNumber(id)}. ${paragraphTitles.get(id)}`);

    title.tabIndex = -1;
    era.append(createElement('span', 'card__era-mark'), eraTitles.get(eraId));
    body.replaceChildren(
      createButton('card__back', '← Все параграфы', onLeave),
      era,
      title,
      createElement(
        'p',
        'card__hint',
        hasEvents
          ? 'На карте все места этого параграфа. Нажми на точку или на событие в пересказе, чтобы рассмотреть его отдельно.'
          : `В этом параграфе нет событий с датой и местом. На карте — места из других параграфов раздела «${eraTitles.get(eraId)}».`,
      ),
    );
    after.replaceChildren();
  };

  // Открыто место целиком: точка, где событий больше MANY_EVENTS.
  // Вопрос тот же, что в карточке события («Где?»), только отвечает на него
  // не одно событие, а всё, что учебник здесь называет
  const renderPlace = ({ id, events }) => {
    const place = places[id];
    const title = createElement('h2', 'card__title', place.name);
    const count = `${events.length} ${plural(events.length, EVENT_FORMS)}`;

    title.tabIndex = -1;
    body.replaceChildren(
      createButton('card__back', '← Все параграфы', onLeave),
      createElement('p', 'card__paragraph', 'Что здесь было'),
      title,
      createElement('p', 'card__hint', `Сейчас: ${place.now}. На этой точке ${count}. Выбери любое, и откроется рассказ.`),
    );
    after.replaceChildren(createEventList('События по порядку', events, null));
  };

  // events — события, которые сейчас видны на карте, по порядку времени;
  // allEvents — все события сайта; paragraph — открытый параграф, если
  // событие в нём ещё не выбрано; place — открытое место со списком
  // его событий, { id, events }
  const update = ({ events, allEvents, selectedEvent, paragraph, place, isParagraphMode }) => {
    body.hidden = !selectedEvent && !paragraph && !place;
    after.hidden = !selectedEvent && !place;
    nav.hidden = !selectedEvent;

    if (!selectedEvent) {
      if (paragraph) {
        renderParagraph(paragraph);
      } else if (place) {
        renderPlace(place);
      } else {
        body.replaceChildren();
        after.replaceChildren();
      }
      return;
    }

    // «Раньше» и «Позже» ходят только по событиям с датой. У события
    // без даты нет соседей во времени, поэтому обе кнопки выключены
    const dated = events.filter((event) => isDated(event.when));
    const index = dated.indexOf(selectedEvent);

    renderEvent(selectedEvent, events, allEvents, isParagraphMode);
    back.disabled = index <= 0;
    forward.disabled = index === -1 || index === dated.length - 1;
    counter.textContent = index === -1 ? 'без даты' : `${index + 1} из ${dated.length}`;
  };

  return {
    update,
    focusTitle: () => body.querySelector('.card__title')?.focus({ preventScroll: true }),
  };
};
