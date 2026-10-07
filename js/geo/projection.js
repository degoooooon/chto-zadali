// Проекция Меркатора для видимого куска карты.
// Этим же модулем пользуется сборщик контуров (tools/build-map.mjs).
// Если считать координаты в двух местах по-разному, точки событий
// съедут с берегов, и Афины окажутся в море.

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + toRadians(lat) / 2));

// У полюсов Меркатор уходит в бесконечность. Без зажима один арктический
// остров даст Infinity в пути, и браузер не нарисует сушу целиком
const MAX_LAT = 80;

// bounds — края карты в градусах, width — её ширина в единицах карты.
// У каждого класса они свои и лежат в js/data/class-N/map.js: Древнему миру
// хватает куска от Испании до Китая, Новому времени нужен весь мир
export const createProjection = ({ bounds, width }) => {
  const scale = width / toRadians(bounds.east - bounds.west);
  const top = mercatorY(bounds.north);

  return {
    bounds,
    width,
    height: (top - mercatorY(bounds.south)) * scale,

    project: (lon, lat) => {
      const safeLat = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));

      return [toRadians(lon - bounds.west) * scale, (top - mercatorY(safeLat)) * scale];
    },
  };
};
