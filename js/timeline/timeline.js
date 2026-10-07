// Лента времени на тетрадном листе в клетку. Событие с точной датой —
// кружок, событие длиной в век или несколько веков — полоска на весь период.

import { createElement } from '../dom.js';
import { formatAxisYear, formatWhen, isDated, isPrehistoric, toSpan } from '../time/when.js';
import { createScale, getTotalCells, stackRows } from './scale.js';

// На экране, где нажимают пальцем, метки крупнее и стоят реже: между
// центрами соседних 20 пикселей, и область нажатия у каждой своя.
// Мышью попасть легко, там метки мельче и лента ниже
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

// Высота метки и диаметр кружка. Стили берут это же число через --mark-size,
// поэтому раскладка рядов и вид метки не могут разойтись
const MARK_SIZE = IS_TOUCH ? 16 : 12;
const MARK_GAP = IS_TOUCH ? 4 : 2;
const ROW_STEP = MARK_SIZE + MARK_GAP;
const BOTTOM_PADDING = 5;
// Верхняя строка листа занята подписями «до нашей эры» и «наша эра».
// На ленте без этих подписей хватает зазора, чтобы верхний ряд меток
// не упирался в край листа
const CAPTION_HEADROOM = 30;
const PLAIN_HEADROOM = 8;
// Уже этого клетка не бывает: метки встают столбом в дюжину рядов.
// На телефоне лента просто прокручивается вбок. При 20 лента 5 класса
// целиком влезает рядом с карточкой на экране шириной 1280
const MIN_CELL = IS_TOUCH ? 26 : 20;
const TIP_HALF_WIDTH = 110;

const centerOf = (mark) => (mark.left + mark.right) / 2;

// settings — шкала ленты этого класса, поля описаны в js/timeline/scale.js
export const createTimeline = ({ root, events: allEvents, eraTitles, settings, onPick }) => {
  const totalCells = getTotalCells(settings);
  const prehistoryCells = settings.prehistoryCells;
  // Граница эр и зона первобытности есть только на ленте Древнего мира.
  // На ленте XVIII века рисовать их негде: года «ноль» на ней нет
  const hasEpoch = settings.startYear < 0 && settings.endYear > 0;
  const hasPrehistory = prehistoryCells > 0;
  const headroom = hasEpoch || hasPrehistory ? CAPTION_HEADROOM : PLAIN_HEADROOM;
  // На ленту попадают события с датой между её краями. Событию без даты
  // и событию «в конце XVII века» на ленте с 1700 года встать некуда.
  // Период, который краем заходит на ленту (династия Цин, 1644–1911),
  // остаётся: его полоску обрежет placeMark
  const isOnTimeline = (when) => {
    if (!isDated(when)) {
      return false;
    }
    if (isPrehistoric(when)) {
      return hasPrehistory;
    }

    const { start, end } = toSpan(when);

    return start === end
      ? start >= settings.startYear && start <= settings.endYear
      : end > settings.startYear && start < settings.endYear;
  };
  const events = allEvents.filter((event) => isOnTimeline(event.when));
  const scroller = root.querySelector('.timeline__scroller');
  const track = createElement('div', 'timeline__track');
  const plot = createElement('div', 'timeline__plot');
  const axis = createElement('div', 'timeline__axis');
  const zone = createElement('div', 'timeline__zone');
  const zoneBreak = createElement('div', 'timeline__break');
  const epochLine = createElement('div', 'timeline__epoch');
  const guide = createElement('div', 'timeline__guide');
  const before = createElement('span', 'timeline__side timeline__side--before', 'до нашей эры');
  const after = createElement('span', 'timeline__side timeline__side--after', 'наша эра');
  const zoneCaption = createElement('span', 'timeline__zone-caption', 'первобытность, шкала сжата');
  const reading = createElement('div', 'timeline__reading');
  const tip = createElement('div', 'timeline__tip');
  const tipTitle = createElement('span', 'timeline__tip-title');
  const tipWhen = createElement('span', 'timeline__tip-when');

  // Подсказка дублирует то, что и так читает скринридер из aria-label метки
  tip.setAttribute('aria-hidden', 'true');
  tip.append(tipTitle, tipWhen);
  track.style.setProperty('--mark-size', `${MARK_SIZE}px`);

  const prehistoric = events.filter((event) => isPrehistoric(event.when));

  const marks = events.map((event) => {
    const button = createElement('button', `timeline__mark era era--${event.era}`);

    button.type = 'button';
    button.setAttribute(
      'aria-label',
      `${formatWhen(event.when)}: ${event.title}. ${eraTitles.get(event.era)}`,
    );
    button.addEventListener('click', () => onPick(event.id));

    return { event, button, left: 0, right: 0, row: 0 };
  });

  const ticks = settings.tickYears.map((year) => ({
    year,
    node: createElement('span', 'timeline__tick', formatAxisYear(year)),
  }));

  const showTip = (mark) => {
    const trackWidth = track.offsetWidth;
    const left = Math.max(TIP_HALF_WIDTH, Math.min(trackWidth - TIP_HALF_WIDTH, centerOf(mark)));

    tipTitle.textContent = mark.event.title;
    tipWhen.textContent = formatWhen(mark.event.when);
    tip.style.left = `${left}px`;
    tip.style.bottom = `${BOTTOM_PADDING + (mark.row + 1) * ROW_STEP + 4}px`;
    tip.classList.add('timeline__tip--visible');
  };

  const hideTip = () => tip.classList.remove('timeline__tip--visible');

  for (const mark of marks) {
    mark.button.addEventListener('pointerenter', () => showTip(mark));
    mark.button.addEventListener('pointerleave', hideTip);
    mark.button.addEventListener('focus', () => showTip(mark));
    mark.button.addEventListener('blur', hideTip);
  }

  // Порядок слоёв: штриховка и линии внизу, подписи над ними, метки сверху
  plot.append(
    ...(hasPrehistory ? [zone, zoneBreak] : []),
    ...(hasEpoch ? [epochLine] : []),
    guide,
    ...(hasPrehistory ? [zoneCaption] : []),
    ...(hasEpoch ? [before, after] : []),
  );
  plot.append(...marks.map((mark) => mark.button), tip);
  axis.append(...ticks.map((tick) => tick.node), reading);
  track.append(plot, axis);
  scroller.append(track);

  let selectedId = null;
  let isLaidOut = false;

  const getSelected = () => marks.find((mark) => mark.event.id === selectedId);

  // На телефоне лента шире экрана. Без прокрутки выбранная на карте
  // метка остаётся за краем, и связь «где — когда» теряется
  const scrollToSelected = (behavior) => {
    const mark = getSelected();

    if (mark) {
      scroller.scrollTo({ left: centerOf(mark) - scroller.clientWidth / 2, behavior });
    }
  };

  const placeSelection = () => {
    const mark = getSelected();

    guide.hidden = !mark;
    reading.hidden = !mark;

    if (!mark) {
      return;
    }

    const isPeriod = mark.right - mark.left > MARK_SIZE;

    // У точной даты — тонкая линия до оси, у периода — полоса во всю его длину
    guide.classList.toggle('timeline__guide--band', isPeriod);
    guide.style.left = `${isPeriod ? mark.left : centerOf(mark)}px`;
    guide.style.width = isPeriod ? `${mark.right - mark.left}px` : '';
    reading.textContent = formatWhen(mark.event.when);

    // У крайних меток плашка с датой наполовину уезжала за край ленты
    const half = reading.offsetWidth / 2 + 4;

    reading.style.left = `${Math.max(half, Math.min(track.offsetWidth - half, centerOf(mark)))}px`;
  };

  const placeMark = (mark, scale) => {
    if (isPrehistoric(mark.event.when)) {
      const center = scale.prehistoricToX(prehistoric.indexOf(mark.event));

      mark.left = center - MARK_SIZE / 2;
      mark.right = center + MARK_SIZE / 2;
      return;
    }

    const { start, end } = toSpan(mark.event.when);
    // Период длиннее ленты рисуем до её края: дальше листа рисовать негде.
    // Настоящие годы видны в подписи метки и в карточке
    const startX = scale.yearToX(Math.max(start, settings.startYear));
    const endX = scale.yearToX(Math.min(end, settings.endYear));

    // Точная дата и короткий период (восстание Спартака, три года) —
    // кружок по центру: полоска короче кружка всё равно не видна
    if (endX - startX <= MARK_SIZE) {
      mark.left = (startX + endX) / 2 - MARK_SIZE / 2;
      mark.right = mark.left + MARK_SIZE;
      return;
    }

    mark.left = startX;
    mark.right = endX;
  };

  const layout = () => {
    const cell = Math.max(MIN_CELL, scroller.clientWidth / totalCells);
    const scale = createScale(settings, cell, prehistoric.length);
    const epochX = scale.yearToX(0);

    marks.forEach((mark) => placeMark(mark, scale));

    // stackRows ждёт отрезки по возрастанию левого края. Порядок событий
    // для этого не годится: у кружка левый край на полкружка раньше даты
    const ordered = [...marks].sort((a, b) => a.left - b.left);
    const rows = stackRows(ordered, MARK_GAP);
    const rowCount = Math.max(...rows) + 1;
    // Высоту листа округляем до целых клеток, иначе верхний ряд клеток обрезан
    const plotCells = Math.ceil((rowCount * ROW_STEP + BOTTOM_PADDING + headroom) / cell);

    ordered.forEach((mark, index) => {
      mark.row = rows[index];
      mark.button.style.left = `${mark.left}px`;
      mark.button.style.width = `${mark.right - mark.left}px`;
      mark.button.style.bottom = `${BOTTOM_PADDING + mark.row * ROW_STEP}px`;
    });

    track.style.width = `${cell * totalCells}px`;
    track.style.setProperty('--cell', `${cell}px`);
    plot.style.height = `${plotCells * cell}px`;
    // Зона кончается на знаке разрыва, за полклетки до начала ровной шкалы
    zone.style.width = `${(prehistoryCells - 0.5) * cell}px`;
    zoneBreak.style.left = `${(prehistoryCells - 0.5) * cell}px`;
    zoneCaption.style.width = `${(prehistoryCells - 0.5) * cell - 14}px`;
    epochLine.style.left = `${epochX}px`;
    before.style.right = `${cell * totalCells - epochX + 10}px`;
    after.style.left = `${epochX + 10}px`;

    for (const tick of ticks) {
      tick.node.style.left = `${scale.yearToX(tick.year)}px`;
    }

    placeSelection();

    // Страницу открыли по ссылке на событие: выбор пришёл раньше, чем
    // лента узнала свою ширину, и прокручивать тогда было некуда
    if (!isLaidOut) {
      isLaidOut = true;
      scrollToSelected('auto');
    }
  };

  new ResizeObserver(layout).observe(scroller);

  const update = ({ visibleIds, selectedId: nextSelectedId }) => {
    const hasChanged = selectedId !== nextSelectedId;

    selectedId = nextSelectedId;

    for (const mark of marks) {
      const isSelected = mark.event.id === selectedId;

      mark.button.classList.toggle('timeline__mark--selected', isSelected);
      mark.button.classList.toggle('timeline__mark--muted', !visibleIds.has(mark.event.id));
      mark.button.setAttribute('aria-pressed', String(isSelected));
    }

    placeSelection();

    if (hasChanged && isLaidOut) {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      scrollToSelected(isReduced ? 'auto' : 'smooth');
    }
  };

  return { update };
};
