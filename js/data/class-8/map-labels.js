// Подписи на карте: океаны, моря и страны XVIII века. Подписи рек сюда
// не входят, их место вычисляет сборщик по самой реке (tools/build-map.mjs).
//
// minZoom — с какого приближения подпись видна, maxZoom — когда её убрать.
// Карта 8 класса — весь мир, поэтому числа здесь больше, чем у 5 класса:
// «1» — это мир целиком, Европа читается примерно с четырёх.

export const MAP_LABELS = [
  { kind: 'sea', text: 'Атлантический океан', lat: 30, lon: -42, minZoom: 1, maxZoom: 6 },
  { kind: 'sea', text: 'Тихий океан', lat: 12, lon: -135, minZoom: 1, maxZoom: 6 },
  { kind: 'sea', text: 'Индийский океан', lat: -18, lon: 78, minZoom: 1, maxZoom: 6 },
  { kind: 'sea', text: 'Средиземное море', lat: 34.6, lon: 18.5, minZoom: 3 },
  { kind: 'sea', text: 'Чёрное море', lat: 43.3, lon: 34.2, minZoom: 5 },
  { kind: 'sea', text: 'Северное море', lat: 56.3, lon: 3.2, minZoom: 5 },
  { kind: 'sea', text: 'Балтийское море', lat: 57.3, lon: 19.6, minZoom: 6 },
  { kind: 'sea', text: 'Карибское море', lat: 15, lon: -75, minZoom: 3 },

  { kind: 'land', text: 'Европа', lat: 50.5, lon: 15, minZoom: 1, maxZoom: 2.5 },
  { kind: 'land', text: 'Азия', lat: 45, lon: 90, minZoom: 1, maxZoom: 2.5 },
  { kind: 'land', text: 'Африка', lat: 8, lon: 20, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Северная Америка', lat: 45, lon: -100, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Южная Америка', lat: -12, lon: -58, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Австралия', lat: -25, lon: 134, minZoom: 1, maxZoom: 5 },

  { kind: 'land', text: 'Франция', lat: 46.4, lon: 2.4, minZoom: 3, maxZoom: 12 },
  { kind: 'land', text: 'Испания', lat: 39.6, lon: -4.2, minZoom: 3, maxZoom: 12 },
  { kind: 'land', text: 'Великобритания', lat: 53.2, lon: -1.6, minZoom: 4, maxZoom: 12 },
  { kind: 'land', text: 'Священная Римская империя', lat: 50.3, lon: 10.4, minZoom: 6, maxZoom: 16 },
  { kind: 'land', text: 'Россия', lat: 56, lon: 44, minZoom: 2.5, maxZoom: 10 },
  { kind: 'land', text: 'Османская империя', lat: 38.6, lon: 33, minZoom: 3, maxZoom: 10 },
  { kind: 'land', text: 'Иран', lat: 32.5, lon: 54.5, minZoom: 3, maxZoom: 10 },
  { kind: 'land', text: 'Индия', lat: 21.5, lon: 78, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Китай', lat: 33, lon: 108, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Япония', lat: 36.6, lon: 138.6, minZoom: 3, maxZoom: 10 },
];
