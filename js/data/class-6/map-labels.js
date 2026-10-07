// Подписи на карте: океаны, моря, части света и страны Средних веков.
// Подписи рек сюда не входят, их место вычисляет сборщик по самой реке
// (tools/build-map.mjs).
//
// minZoom — с какого приближения подпись видна, maxZoom — когда её убрать.
// Карта почти на весь мир, как у 8 класса: «1» — это карта целиком,
// Европа читается примерно с четырёх.
//
// За тысячу лет границы менялись много раз. Подписаны только те страны
// и земли, название которых держалось большую часть эпохи

export const MAP_LABELS = [
  { kind: 'sea', text: 'Атлантический океан', lat: 30, lon: -42, minZoom: 1, maxZoom: 6 },
  { kind: 'sea', text: 'Тихий океан', lat: 5, lon: -108, minZoom: 1, maxZoom: 6 },
  { kind: 'sea', text: 'Индийский океан', lat: -15, lon: 75, minZoom: 1, maxZoom: 6 },
  { kind: 'sea', text: 'Средиземное море', lat: 34.6, lon: 18.5, minZoom: 3 },
  { kind: 'sea', text: 'Чёрное море', lat: 43.3, lon: 34.2, minZoom: 5 },
  { kind: 'sea', text: 'Северное море', lat: 56.3, lon: 3.2, minZoom: 5 },
  { kind: 'sea', text: 'Балтийское море', lat: 57.3, lon: 19.6, minZoom: 6 },
  { kind: 'sea', text: 'Красное море', lat: 20.5, lon: 38.3, minZoom: 5 },

  { kind: 'land', text: 'Европа', lat: 50.5, lon: 15, minZoom: 1, maxZoom: 2.5 },
  { kind: 'land', text: 'Азия', lat: 45, lon: 90, minZoom: 1, maxZoom: 2.5 },
  { kind: 'land', text: 'Африка', lat: 8, lon: 20, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Северная Америка', lat: 45, lon: -100, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Южная Америка', lat: -12, lon: -58, minZoom: 1, maxZoom: 3 },

  { kind: 'land', text: 'Франция', lat: 46.4, lon: 2.4, minZoom: 3, maxZoom: 12 },
  { kind: 'land', text: 'Англия', lat: 53.0, lon: -1.6, minZoom: 4, maxZoom: 12 },
  { kind: 'land', text: 'Пиренейский полуостров', lat: 39.6, lon: -4.2, minZoom: 4, maxZoom: 12 },
  { kind: 'land', text: 'Германия', lat: 50.6, lon: 10.2, minZoom: 4, maxZoom: 14 },
  { kind: 'land', text: 'Италия', lat: 43.0, lon: 12.4, minZoom: 4, maxZoom: 12 },
  { kind: 'land', text: 'Скандинавия', lat: 62.5, lon: 14.5, minZoom: 3, maxZoom: 10 },
  { kind: 'land', text: 'Византия', lat: 39.2, lon: 31.5, minZoom: 3, maxZoom: 10 },
  { kind: 'land', text: 'Русь', lat: 55.5, lon: 36, minZoom: 2.5, maxZoom: 10 },
  { kind: 'land', text: 'Аравия', lat: 23.5, lon: 45, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Иран', lat: 32.5, lon: 54.5, minZoom: 3, maxZoom: 10 },
  { kind: 'land', text: 'Индия', lat: 21.5, lon: 78, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Китай', lat: 33, lon: 108, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Япония', lat: 36.6, lon: 138.6, minZoom: 3, maxZoom: 10 },
];
