// Легенда: какой цвет у какого раздела учебника. Она же фильтр —
// нажатый раздел убирается с карты.

import { createElement } from '../dom.js';

export const createLegend = ({ root, eras, onToggle }) => {
  const list = root.querySelector('.legend__list');
  const toggles = new Map();

  for (const era of eras) {
    const item = createElement('li', 'legend__item');
    const toggle = createElement('button', `legend__toggle era era--${era.id}`);

    toggle.type = 'button';
    toggle.append(
      createElement('span', 'legend__mark'),
      createElement('span', 'legend__title', era.title),
    );
    toggle.addEventListener('click', () => onToggle(era.id));
    item.append(toggle);
    list.append(item);
    toggles.set(era.id, toggle);
  }

  // isOff — легенда сейчас не действует (открыт один параграф), её прячем
  const update = ({ hiddenEras, isOff }) => {
    root.hidden = isOff;

    for (const [eraId, toggle] of toggles) {
      const isShown = !hiddenEras.has(eraId);

      toggle.setAttribute('aria-pressed', String(isShown));
      toggle.classList.toggle('legend__toggle--off', !isShown);
    }
  };

  return { update };
};
