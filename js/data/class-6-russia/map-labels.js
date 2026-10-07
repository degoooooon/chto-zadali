// Подписи на карте: моря, озёра, соседние страны и края. Подписи рек сюда
// не входят, их место вычисляет сборщик по самой реке (tools/build-map.mjs).
//
// minZoom — с какого приближения подпись видна, maxZoom — когда её убрать.
// «1» — это карта целиком, от Дуная до Монголии; Русь читается примерно с двух.
//
// За семь веков границы менялись много раз. Подписаны только те страны
// и земли, название которых держалось большую часть эпохи

export const MAP_LABELS = [
  { kind: 'sea', text: 'Балтийское море', lat: 57.6, lon: 19.6, minZoom: 2 },
  { kind: 'sea', text: 'Чёрное море', lat: 43.3, lon: 34.2, minZoom: 1.5 },
  { kind: 'sea', text: 'Каспийское море', lat: 41.8, lon: 50.8, minZoom: 1.5 },
  { kind: 'sea', text: 'Азовское море', lat: 46.1, lon: 36.6, minZoom: 5 },
  { kind: 'sea', text: 'Белое море', lat: 65.6, lon: 37.5, minZoom: 3 },
  { kind: 'sea', text: 'Ладожское озеро', lat: 60.9, lon: 31.6, minZoom: 5 },

  { kind: 'land', text: 'Русь', lat: 55.6, lon: 35.5, minZoom: 1, maxZoom: 4 },
  { kind: 'land', text: 'Скандинавия', lat: 62.5, lon: 14.5, minZoom: 1.5, maxZoom: 6 },
  { kind: 'land', text: 'Византия', lat: 39.4, lon: 31.5, minZoom: 1.5, maxZoom: 6 },
  { kind: 'land', text: 'Польша', lat: 52.3, lon: 19.6, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Степь', lat: 48.2, lon: 44.5, minZoom: 1.5, maxZoom: 5 },
  { kind: 'land', text: 'Кавказ', lat: 42.6, lon: 44.5, minZoom: 2.5, maxZoom: 8 },
  { kind: 'land', text: 'Средняя Азия', lat: 41.5, lon: 64, minZoom: 1.5, maxZoom: 6 },
  { kind: 'land', text: 'Монголия', lat: 46.8, lon: 104, minZoom: 1, maxZoom: 6 },
  { kind: 'land', text: 'Китай', lat: 36.5, lon: 110, minZoom: 1, maxZoom: 6 },
];
