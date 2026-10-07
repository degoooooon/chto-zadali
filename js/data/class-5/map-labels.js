// Подписи на карте: моря и древние страны. Подписи рек сюда не входят,
// их место вычисляет сборщик по самой реке (tools/build-map.mjs).
//
// minZoom — с какого приближения подпись видна. Мелкие страны на общем
// виде слипаются в кашу, поэтому появляются только вблизи.
// maxZoom — когда подпись убрать: вблизи слово «ИНДИЯ» висит над пустотой.

export const MAP_LABELS = [
  { kind: 'sea', text: 'Средиземное море', lat: 33.6, lon: 20.5, minZoom: 1 },
  { kind: 'sea', text: 'Чёрное море', lat: 43.3, lon: 34.2, minZoom: 1 },
  { kind: 'sea', text: 'Красное море', lat: 19.5, lon: 39.0, minZoom: 1.6 },
  { kind: 'sea', text: 'Каспийское море', lat: 41.6, lon: 50.8, minZoom: 1.6 },
  { kind: 'sea', text: 'Персидский залив', lat: 26.8, lon: 51.6, minZoom: 2.2 },
  { kind: 'sea', text: 'Аравийское море', lat: 15, lon: 63, minZoom: 1 },
  { kind: 'sea', text: 'Бенгальский залив', lat: 14, lon: 89, minZoom: 1.6 },
  { kind: 'sea', text: 'Индийский океан', lat: -5, lon: 72, minZoom: 1 },
  { kind: 'sea', text: 'Атлантический океан', lat: 37, lon: -14.5, minZoom: 2.4 },
  { kind: 'sea', text: 'Эгейское море', lat: 38.6, lon: 25.2, minZoom: 5 },
  { kind: 'sea', text: 'Адриатическое море', lat: 42.8, lon: 15.6, minZoom: 5 },

  { kind: 'land', text: 'Египет', lat: 27.2, lon: 29.2, minZoom: 1, maxZoom: 7 },
  { kind: 'land', text: 'Двуречье', lat: 35.0, lon: 41.2, minZoom: 1.6, maxZoom: 7 },
  { kind: 'land', text: 'Персия', lat: 32.5, lon: 55.5, minZoom: 1, maxZoom: 7 },
  { kind: 'land', text: 'Индия', lat: 21.5, lon: 78, minZoom: 1, maxZoom: 5 },
  { kind: 'land', text: 'Китай', lat: 32.6, lon: 114.5, minZoom: 1, maxZoom: 5 },
  { kind: 'land', text: 'Греция', lat: 39.6, lon: 21.6, minZoom: 2.4, maxZoom: 7 },
  { kind: 'land', text: 'Италия', lat: 43.1, lon: 11.6, minZoom: 1.6, maxZoom: 7 },
  { kind: 'land', text: 'Малая Азия', lat: 38.9, lon: 32.5, minZoom: 2.4, maxZoom: 7 },
  { kind: 'land', text: 'Аравия', lat: 23.5, lon: 45.5, minZoom: 1.6, maxZoom: 5 },
  { kind: 'land', text: 'Галлия', lat: 47, lon: 2.3, minZoom: 1.6, maxZoom: 7 },
  { kind: 'land', text: 'Испания', lat: 40, lon: -4.2, minZoom: 1.6, maxZoom: 7 },
  { kind: 'land', text: 'Британия', lat: 52.6, lon: -1.6, minZoom: 2.4, maxZoom: 7 },
  { kind: 'land', text: 'Нубия', lat: 20.3, lon: 30, minZoom: 2.4, maxZoom: 7 },
  { kind: 'land', text: 'Африка', lat: 10, lon: 20, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Ассирия', lat: 36.9, lon: 41.5, minZoom: 4, maxZoom: 10 },
  { kind: 'land', text: 'Финикия', lat: 34.1, lon: 36.3, minZoom: 6 },
  { kind: 'land', text: 'Палестина', lat: 32.3, lon: 35.9, minZoom: 6 },
  { kind: 'land', text: 'Македония', lat: 41.0, lon: 22.3, minZoom: 5 },
  { kind: 'land', text: 'Крит', lat: 35.0, lon: 24.6, minZoom: 5 },
  { kind: 'land', text: 'Сицилия', lat: 37.5, lon: 14.1, minZoom: 5 },
];
