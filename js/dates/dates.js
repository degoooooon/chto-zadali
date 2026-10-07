// Все даты одной таблицей: чтобы повторить перед контрольной и чтобы
// события можно было найти без карты, например с программой чтения экрана.

import { createElement } from '../dom.js';
import { formatWhen } from '../time/when.js';

export const createDates = ({ root, events, places, eraTitles, onPick }) => {
  const body = root.querySelector('.dates__body');

  for (const event of events) {
    const row = createElement('tr', 'dates__row');
    const titleCell = createElement('td', 'dates__cell');
    const link = createElement('button', 'dates__link');

    link.type = 'button';
    link.append(
      createElement('span', `dates__mark era era--${event.era}`),
      createElement('span', 'dates__title', event.title),
    );
    link.addEventListener('click', () => onPick(event.id));
    titleCell.append(link);

    row.append(
      createElement('td', 'dates__cell dates__cell--when', formatWhen(event.when)),
      titleCell,
      createElement('td', 'dates__cell', places[event.place].name),
      createElement('td', 'dates__cell dates__cell--era', eraTitles.get(event.era)),
    );
    body.append(row);
  }
};
