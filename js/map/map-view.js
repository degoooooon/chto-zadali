// Рисует подложку карты и управляет «камерой»: сдвигом и приближением.
// Точки событий и подписи живут в своих модулях и спрашивают отсюда,
// куда на экране попадает точка карты.

import { createSvgElement } from '../dom.js';

export const MIN_ZOOM = 1;
// Предел приближения: столько пикселей приходится на единицу карты.
// Дальше контуры 1:50 000 000 превращаются в ломаную, смотреть не на что.
// Предел задан в пикселях, а не «во сколько раз»: на телефоне общий вид
// вдвое мельче, и при счёте в разах Марафон с Саламином там не разлепить
const MAX_SCALE = 9;

const GRATICULE_STEP = 10;
const FLIGHT_MS = 700;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildGraticule = ({ bounds, width, height, project }) => {
  const lines = [];

  for (let lon = Math.ceil(bounds.west / GRATICULE_STEP) * GRATICULE_STEP; lon <= bounds.east; lon += GRATICULE_STEP) {
    const [x] = project(lon, 0);
    lines.push(`M${x.toFixed(1)} 0V${height.toFixed(1)}`);
  }
  for (let lat = Math.ceil(bounds.south / GRATICULE_STEP) * GRATICULE_STEP; lat <= bounds.north; lat += GRATICULE_STEP) {
    const [, y] = project(0, lat);
    lines.push(`M0 ${y.toFixed(1)}H${width}`);
  }

  return lines.join('');
};

// projection — проекция карты этого класса (js/geo/projection.js),
// home — точка { lon, lat }, на которой стоит первый кадр: на узком экране
// вся карта не влезает, и показывать надо то место, где больше событий
export const createMapView = (viewport, mapData, { projection, home }) => {
  const { width: mapWidth, height: mapHeight, project } = projection;
  const homeCenter = project(home.lon, home.lat);
  const svg = createSvgElement('svg', 'map__svg', { 'aria-hidden': 'true', focusable: 'false' });
  const world = createSvgElement('g', 'map__world');
  const overlay = createSvgElement('g', 'map__overlay');

  world.append(
    createSvgElement('path', 'map__graticule', { d: buildGraticule(projection) }),
    // Тот же контур ещё раз, широкой бледной линией под сушей:
    // получается голубая кайма вдоль берега, как в школьном атласе
    createSvgElement('path', 'map__shore', { d: mapData.land }),
    createSvgElement('path', 'map__land', { d: mapData.land }),
    createSvgElement('path', 'map__river', { d: mapData.rivers.minor }),
    createSvgElement('path', 'map__river map__river--major', { d: mapData.rivers.major }),
  );
  svg.append(world, overlay);
  // В начало, а не в конец: слой с точками событий должен лежать поверх карты
  viewport.prepend(svg);

  const camera = { scale: 1, x: 0, y: 0 };
  const size = { width: 0, height: 0 };
  const listeners = new Set();
  const readyCallbacks = [];
  let flight = 0;
  let isPlaced = false;

  // Минимальный масштаб — когда карта закрывает окно целиком.
  // Если брать «вписать», по краям видно, где обрезаны контуры
  const fitScale = () => Math.max(size.width / mapWidth, size.height / mapHeight);

  const getZoom = () => camera.scale / fitScale();

  const getMaxZoom = () => MAX_SCALE / fitScale();

  const getCenter = () => [
    (size.width / 2 - camera.x) / camera.scale,
    (size.height / 2 - camera.y) / camera.scale,
  ];

  const apply = () => {
    camera.scale = clamp(camera.scale, fitScale() * MIN_ZOOM, MAX_SCALE);
    // Не даём утащить карту так, чтобы показался её край
    camera.x = clamp(camera.x, size.width - mapWidth * camera.scale, 0);
    camera.y = clamp(camera.y, size.height - mapHeight * camera.scale, 0);

    world.setAttribute('transform', `translate(${camera.x} ${camera.y}) scale(${camera.scale})`);
    listeners.forEach((listener) => listener());
  };

  const setView = ([centerX, centerY], zoom) => {
    camera.scale = fitScale() * zoom;
    camera.x = size.width / 2 - centerX * camera.scale;
    camera.y = size.height / 2 - centerY * camera.scale;
    apply();
  };

  const stop = () => {
    cancelAnimationFrame(flight);
  };

  const flyTo = (center, zoom) => {
    stop();

    const targetZoom = clamp(zoom, MIN_ZOOM, getMaxZoom());

    // Кому анимация мешает (укачивает, отвлекает), тому просто переставляем кадр
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setView(center, targetZoom);
      return;
    }

    const fromCenter = getCenter();
    const fromZoom = getZoom();
    const startedAt = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / FLIGHT_MS);
      const eased = 1 - (1 - progress) ** 3;

      setView(
        [
          fromCenter[0] + (center[0] - fromCenter[0]) * eased,
          fromCenter[1] + (center[1] - fromCenter[1]) * eased,
        ],
        // Масштаб ведём по степени, а не по прямой: иначе приближение
        // кажется рывком в начале и ползёт в конце
        fromZoom * (targetZoom / fromZoom) ** eased,
      );

      if (progress < 1) {
        flight = requestAnimationFrame(step);
      }
    };

    flight = requestAnimationFrame(step);
  };

  const zoomAt = ([screenX, screenY], factor) => {
    const nextScale = clamp(camera.scale * factor, fitScale() * MIN_ZOOM, MAX_SCALE);
    const ratio = nextScale / camera.scale;

    // Точка под курсором остаётся под курсором
    camera.x = screenX - (screenX - camera.x) * ratio;
    camera.y = screenY - (screenY - camera.y) * ratio;
    camera.scale = nextScale;
    apply();
  };

  const panBy = (deltaX, deltaY) => {
    camera.x += deltaX;
    camera.y += deltaY;
    apply();
  };

  const reset = () => flyTo(homeCenter, MIN_ZOOM);

  // Кадр, в который помещаются все точки параграфа. Поля оставляем большие:
  // у точек есть подписи, и у самого края окна они обрезаются
  const BOUNDS_FILL = 0.6;

  const getBoundsView = (points) => {
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    const center = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
    // Одна точка или несколько в одном месте: размаха нет, делить не на что.
    // Тогда берём средний план, а не упираемся носом в одну точку
    const zoom = Math.min(
      spanX ? (size.width * BOUNDS_FILL) / (spanX * fitScale()) : getMaxZoom() / 3,
      spanY ? (size.height * BOUNDS_FILL) / (spanY * fitScale()) : getMaxZoom() / 3,
    );

    return { center, zoom: clamp(zoom, MIN_ZOOM, getMaxZoom()) };
  };

  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;

    // Скрытая вкладка сообщает нулевой размер, деление на него даёт NaN
    if (!width || !height) {
      return;
    }

    const center = isPlaced ? getCenter() : homeCenter;
    const zoom = isPlaced ? getZoom() : MIN_ZOOM;

    size.width = width;
    size.height = height;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    setView(center, zoom);

    if (!isPlaced) {
      isPlaced = true;
      readyCallbacks.forEach((callback) => callback());
    }
  }).observe(viewport);

  return {
    overlay,
    // Градусы — в точку карты. Точки событий, подписи и мини-карта берут
    // проекцию отсюда: у всех слоёв она обязана быть одна
    project,
    getMapSize: () => ({ width: mapWidth, height: mapHeight }),
    toScreen: ([x, y]) => [x * camera.scale + camera.x, y * camera.scale + camera.y],
    getZoom,
    getMaxZoom,
    getSize: () => size,
    getFitScale: fitScale,
    // Какая часть карты сейчас в окне, в координатах карты
    getVisibleRect: () => ({
      x: -camera.x / camera.scale,
      y: -camera.y / camera.scale,
      width: size.width / camera.scale,
      height: size.height / camera.scale,
    }),
    flyTo,
    getBoundsView,
    // То же, что flyTo, но без перелёта
    jumpTo: (center, zoom) => {
      stop();
      setView(center, clamp(zoom, MIN_ZOOM, getMaxZoom()));
    },
    zoomAt,
    panBy,
    reset,
    stop,
    onChange: (listener) => {
      listeners.add(listener);
    },
    // Размер окна камера узнаёт не сразу, а когда браузер разложит страницу.
    // Лететь к событию раньше нельзя: масштаб считается от нулевой ширины
    onReady: (callback) => {
      if (isPlaced) {
        callback();
      } else {
        readyCallbacks.push(callback);
      }
    },
  };
};
