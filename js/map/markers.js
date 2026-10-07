// Точки событий на карте. Одна точка — одно место: в Риме десять событий,
// и десять кружков друг на друге никто бы не разобрал.

import { createElement } from '../dom.js';
import { EVENT_FORMS, plural } from '../text/plural.js';

// Размеры для расчёта, влезет ли подпись. Те же числа стоят в css/marker.css
// (кружок 22px с ободком, отступ подписи 12px, строка 16px) — правь оба места
const DOT_RADIUS = 9;
const LABEL_GAP = 12;
const LABEL_HEIGHT = 16;

// На сколько пикселей надо развести соседние точки, чтобы попасть пальцем
const SEPARATION_PX = 40;
// Ближе этого точки считаем слипшимися: пальцем или мышью в нужную не попасть
const CROWDED_PX = 24;
// Точка ближе этого к краю окна считается плохо видной
const EDGE_MARGIN = 40;
const MIN_FOCUS_ZOOM = 2.2;

const overlaps = (a, b) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const dotBox = ([x, y]) => ({
  left: x - DOT_RADIUS,
  right: x + DOT_RADIUS,
  top: y - DOT_RADIUS,
  bottom: y + DOT_RADIUS,
});

const labelBox = ([x, y], width, side) => ({
  left: side === 'right' ? x + LABEL_GAP : x - LABEL_GAP - width,
  right: side === 'right' ? x + LABEL_GAP + width : x - LABEL_GAP,
  top: y - LABEL_HEIGHT / 2,
  bottom: y + LABEL_HEIGHT / 2,
});

export const createMarkers = ({ container, view, places, onPick, onCrowding }) => {
  const items = new Map();

  for (const [placeId, place] of Object.entries(places)) {
    const button = createElement('button', 'marker era');
    const dot = createElement('span', 'marker__dot');
    const label = createElement('span', 'marker__label', place.name);

    button.type = 'button';
    button.hidden = true;
    button.append(dot, label);
    button.addEventListener('click', () => onPick(placeId));
    container.append(button);

    items.set(placeId, {
      place,
      button,
      dot,
      label,
      point: view.project(place.lon, place.lat),
      labelWidth: 0,
      eraId: '',
      count: 0,
      isSelected: false,
    });
  }

  const shown = () => [...items.values()].filter((item) => item.count > 0);

  // Подписи ставим по очереди: выбранное место, потом места, где больше
  // событий. Кому не хватило свободного места, остаётся без подписи,
  // она появится при наведении или при приближении
  const isOnScreen = ([x, y], margin = 0) => {
    const { width, height } = view.getSize();

    return x > margin && x < width - margin && y > margin && y < height - margin;
  };

  const layout = () => {
    const { width } = view.getSize();
    const visible = shown().map((item) => ({ item, screen: view.toScreen(item.point) }));
    const inView = visible.filter(({ screen }) => isOnScreen(screen));

    // Сообщаем наружу, есть ли на экране слипшиеся точки: по этому
    // признаку карта показывает подсказку «приблизь»
    onCrowding(
      inView.some(({ item, screen }) =>
        inView.some(
          (other) =>
            other.item !== item &&
            Math.hypot(other.screen[0] - screen[0], other.screen[1] - screen[1]) < CROWDED_PX,
        ),
      ),
    );
    const dots = visible.map(({ item, screen }) => ({ item, box: dotBox(screen) }));
    const placedLabels = [];

    visible.sort((a, b) => b.item.isSelected - a.item.isSelected || b.item.count - a.item.count);

    for (const { item, screen } of visible) {
      const [x, y] = screen;

      item.button.style.transform = `translate(${x}px, ${y}px)`;

      const isFree = (box) =>
        // Подпись, обрезанная краем карты, хуже, чем никакой: «а Альтамира»
        box.left >= 0 &&
        box.right <= width &&
        !placedLabels.some((other) => overlaps(box, other)) &&
        !dots.some((other) => other.item !== item && overlaps(box, other.box));

      const side = ['right', 'left'].find((candidate) =>
        isFree(labelBox(screen, item.labelWidth, candidate)),
      );
      // Выбранному месту подпись показываем всегда, даже поверх соседей:
      // иначе непонятно, что именно выбрано
      const finalSide = side ?? (item.isSelected ? 'right' : null);
      const isLabeled = isOnScreen(screen) && item.labelWidth > 0 && finalSide !== null;

      item.button.classList.toggle('marker--labeled', isLabeled);
      item.button.classList.toggle('marker--label-left', finalSide === 'left');

      if (isLabeled) {
        placedLabels.push(labelBox(screen, item.labelWidth, finalSide));
      }
    }
  };

  const measureLabels = () => {
    for (const item of items.values()) {
      item.labelWidth = item.label.offsetWidth;
    }
    layout();
  };

  // Ширину подписей меряем после загрузки шрифта: с запасным шрифтом
  // строки другой длины, и подписи наедут друг на друга
  document.fonts.ready.then(measureLabels);
  view.onChange(layout);

  // openPlaceId — место, открытое списком событий (js/card/card.js):
  // событие в нём ещё не выбрано, но точку надо выделить так же
  const update = ({ events, selectedEvent, openPlaceId }) => {
    for (const [placeId, item] of items) {
      const placeEvents = events.filter((event) => event.place === placeId);
      const hasSelectedEvent = selectedEvent?.place === placeId;
      const isSelected = hasSelectedEvent || openPlaceId === placeId;
      // Цвет точки — по первому событию места. Когда в месте выбрано
      // событие, точка берёт его цвет, чтобы совпасть с карточкой
      const eraId = (hasSelectedEvent ? selectedEvent : placeEvents[0])?.era ?? '';

      if (item.eraId !== eraId) {
        if (item.eraId) {
          item.button.classList.remove(`era--${item.eraId}`);
        }
        if (eraId) {
          item.button.classList.add(`era--${eraId}`);
        }
        item.eraId = eraId;
      }

      item.count = placeEvents.length;
      item.isSelected = isSelected;
      item.button.hidden = item.count === 0;
      item.button.classList.toggle('marker--many', item.count > 1);
      item.button.classList.toggle('marker--selected', isSelected);
      item.button.setAttribute('aria-pressed', String(isSelected));
      item.button.setAttribute(
        'aria-label',
        `${item.place.name}: ${item.count} ${plural(item.count, EVENT_FORMS)}`,
      );
      item.dot.textContent = item.count > 1 ? String(item.count) : '';
    }

    // offsetWidth у скрытой кнопки равен нулю, поэтому после смены
    // набора точек ширину подписей надо снять заново
    measureLabels();
  };

  // Приближение, при котором место не сливается с ближайшим соседом.
  // Афины, Марафон и Саламин на общем виде — одна клякса
  const getFocusZoom = (placeId) => {
    const target = items.get(placeId);
    const distances = shown()
      .filter((item) => item !== target)
      .map((item) => Math.hypot(item.point[0] - target.point[0], item.point[1] - target.point[1]));

    if (!distances.length) {
      return MIN_FOCUS_ZOOM;
    }

    const zoom = SEPARATION_PX / (Math.min(...distances) * view.getFitScale());

    return Math.max(MIN_FOCUS_ZOOM, Math.min(view.getMaxZoom(), zoom));
  };

  // Точку и так хорошо видно: она в окне, не у края и не слиплась с соседней.
  // Тогда камеру не трогаем — карта не должна дёргаться на каждое нажатие
  const isClear = (placeId) => {
    const target = items.get(placeId);
    const screen = view.toScreen(target.point);

    return (
      isOnScreen(screen, EDGE_MARGIN) &&
      shown().every((item) => {
        const [x, y] = view.toScreen(item.point);

        return item === target || Math.hypot(x - screen[0], y - screen[1]) >= CROWDED_PX;
      })
    );
  };

  return {
    update,
    getFocusZoom,
    isClear,
    getPoint: (placeId) => items.get(placeId).point,
  };
};
