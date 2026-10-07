// Собирает контуры суши и рек для карты каждого класса из исходников
// Natural Earth (общественное достояние). Запуск: npm run build:map
//
// Что вырезать и куда положить, сборщик берёт у класса: границы, ширина,
// список рек и адрес файла записаны в js/data/class-N/map.js.
//
// Исходники лежат в tools/natural-earth/, скачаны отсюда:
// https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
//   ne_50m_land.geojson
//   ne_50m_rivers_lake_centerlines.geojson

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLASSES } from '../js/data/classes.js';
import { createProjection } from '../js/geo/projection.js';

const SOURCE_DIR = new URL('./natural-earth/', import.meta.url);
const SITE_ROOT = new URL('../', import.meta.url);

// Режем с запасом. Обрезка оставляет ребро вдоль линии реза, и без запаса
// это ребро видно как прямая «береговая линия» по краю карты
const MARGIN = 5;

const readGeoJson = async (name) =>
  JSON.parse(await readFile(new URL(name, SOURCE_DIR), 'utf8'));

// Контуры одной карты. map — настройки из js/data/class-N/map.js,
// sources — разобранные исходники Natural Earth
const buildMap = ({ bounds, width, rivers }, sources) => {
  const { project } = createProjection({ bounds, width });
  const clip = {
    west: bounds.west - MARGIN,
    east: bounds.east + MARGIN,
    south: bounds.south - MARGIN,
    north: bounds.north + MARGIN,
  };

  // Обрезка многоугольника прямоугольником, алгоритм Сазерленда — Ходжмана:
  // четыре прохода, по одному на каждую сторону
  const clipRing = (ring) => {
    const edges = [
      { inside: ([x]) => x >= clip.west, cut: (a, b) => cutAtX(a, b, clip.west) },
      { inside: ([x]) => x <= clip.east, cut: (a, b) => cutAtX(a, b, clip.east) },
      { inside: ([, y]) => y >= clip.south, cut: (a, b) => cutAtY(a, b, clip.south) },
      { inside: ([, y]) => y <= clip.north, cut: (a, b) => cutAtY(a, b, clip.north) },
    ];

    let points = ring;

    for (const { inside, cut } of edges) {
      const result = [];

      for (let i = 0; i < points.length; i += 1) {
        const current = points[i];
        const previous = points[(i + points.length - 1) % points.length];

        if (inside(current)) {
          if (!inside(previous)) {
            result.push(cut(previous, current));
          }
          result.push(current);
        } else if (inside(previous)) {
          result.push(cut(previous, current));
        }
      }

      points = result;

      if (points.length < 3) {
        return [];
      }
    }

    return points;
  };

  const cutAtX = ([x1, y1], [x2, y2], x) => [x, y1 + ((y2 - y1) * (x - x1)) / (x2 - x1)];
  const cutAtY = ([x1, y1], [x2, y2], y) => [x1 + ((x2 - x1) * (y - y1)) / (y2 - y1), y];

  const isInsideClip = ([x, y]) =>
    x >= clip.west && x <= clip.east && y >= clip.south && y <= clip.north;

  // Линию не обрезаем точно, а просто рвём на куски, лежащие внутри:
  // всё равно разрыв приходится на невидимый запас
  const clipLine = (line) => {
    const pieces = [];
    let piece = [];

    for (const point of line) {
      if (isInsideClip(point)) {
        piece.push(point);
      } else if (piece.length) {
        pieces.push(piece);
        piece = [];
      }
    }

    if (piece.length) {
      pieces.push(piece);
    }

    return pieces.filter((item) => item.length > 1);
  };

  // Координаты пишем десятыми долями и относительными шагами: файл выходит
  // втрое меньше, чем с абсолютными числами. Разности считаем от уже
  // округлённых значений, иначе ошибка копится и берег уползает
  const toPath = (points, isClosed) => {
    const tenths = points.map(([lon, lat]) => project(lon, lat).map((n) => Math.round(n * 10)));
    const [startX, startY] = tenths[0];
    const steps = [];
    let [x, y] = tenths[0];

    for (const [nextX, nextY] of tenths.slice(1)) {
      if (nextX === x && nextY === y) {
        continue;
      }
      steps.push(`${(nextX - x) / 10} ${(nextY - y) / 10}`);
      [x, y] = [nextX, nextY];
    }

    // Меньше двух шагов у контура — это точка или отрезок, площади у него нет
    if (steps.length < (isClosed ? 2 : 1)) {
      return '';
    }

    return `M${startX / 10} ${startY / 10}l${steps.join(' ')}${isClosed ? 'z' : ''}`;
  };

  const polygonsOf = ({ type, coordinates }) => (type === 'Polygon' ? [coordinates] : coordinates);
  const linesOf = ({ type, coordinates }) => (type === 'LineString' ? [coordinates] : coordinates);

  const buildLand = (geojson) => {
    const paths = [];
    let pointCount = 0;

    for (const feature of geojson.features) {
      for (const polygon of polygonsOf(feature.geometry)) {
        for (const ring of polygon) {
          const clipped = clipRing(ring);

          if (clipped.length) {
            const path = toPath(clipped, true);

            if (path) {
              paths.push(path);
              pointCount += clipped.length;
            }
          }
        }
      }
    }

    return { path: paths.join(''), pointCount };
  };

  const gap = ([x1, y1], [x2, y2]) => Math.hypot(x1 - x2, y1 - y2);

  // Ближайшая к target точка из набора
  const nearestPoint = (points, target) =>
    points.reduce((best, point) => (gap(point, target) < gap(best, target) ? point : best));

  const buildRivers = (geojson) => {
    const historicNames = new Map(
      rivers.flatMap((river) => river.names.map((name) => [name, river])),
    );
    const majorPaths = [];
    const minorPaths = [];
    const riverPoints = new Map();

    for (const feature of geojson.features) {
      if (!feature.geometry) {
        continue;
      }

      const river = historicNames.get(feature.properties.name_en ?? feature.properties.name);

      for (const line of linesOf(feature.geometry)) {
        for (const piece of clipLine(line)) {
          const path = toPath(piece, false);

          if (!path) {
            continue;
          }

          (river ? majorPaths : minorPaths).push(path);

          if (river) {
            riverPoints.set(river, [...(riverPoints.get(river) ?? []), ...piece]);
          }
        }
      }
    }

    const labels = rivers.filter((river) => riverPoints.has(river)).map((river) => {
      const [lon, lat] = nearestPoint(riverPoints.get(river), river.near);

      return {
        text: river.label,
        lon: Number(lon.toFixed(3)),
        lat: Number(lat.toFixed(3)),
        minZoom: river.minZoom,
      };
    });

    const missing = rivers.filter((river) => !riverPoints.has(river)).map((r) => r.label);

    return { major: majorPaths.join(''), minor: minorPaths.join(''), labels, missing };
  };

  return { land: buildLand(sources.land), rivers: buildRivers(sources.rivers) };
};

const sizeKb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(0)} КБ`;

const sources = {
  land: await readGeoJson('ne_50m_land.geojson'),
  rivers: await readGeoJson('ne_50m_rivers_lake_centerlines.geojson'),
};

for (const { id, map } of CLASSES) {
  const { land, rivers } = buildMap(map, sources);
  const output = JSON.stringify({
    source: 'Natural Earth 1:50m, общественное достояние, naturalearthdata.com',
    land: land.path,
    rivers: { major: rivers.major, minor: rivers.minor },
    riverLabels: rivers.labels,
  });
  const file = fileURLToPath(new URL(map.url, SITE_ROOT));

  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, output);

  console.log(`${id} класс, ${map.url}: ${sizeKb(output)}`);
  console.log(`  суша: ${land.pointCount} точек, ${sizeKb(land.path)}`);
  console.log(`  реки: главные ${sizeKb(rivers.major)}, остальные ${sizeKb(rivers.minor)}`);
  console.log(`  подписи рек: ${rivers.labels.map((label) => label.text).join(', ') || 'нет'}`);
  if (rivers.missing.length) {
    console.log(`  НЕ НАЙДЕНЫ в исходнике: ${rivers.missing.join(', ')}`);
  }
}
