// Подписи на карте: моря, озёра, соседние страны и края. Подписи рек сюда
// не входят, их место вычисляет сборщик по самой реке (tools/build-map.mjs).
//
// minZoom — с какого приближения подпись видна, maxZoom — когда её убрать.
// «1» — это карта целиком, от Балтики до Тихого океана; европейская часть
// читается примерно с двух.
//
// За полтора века границы менялись много раз. Подписаны страны и края,
// названия которых учебник употребляет на всём протяжении. Ливония
// подписана, хотя после 1561 года такого государства нет: без неё
// не показать, за что шла война

export const MAP_LABELS = [
  { kind: 'sea', text: 'Балтийское море', lat: 57.8, lon: 19.8, minZoom: 2 },
  { kind: 'sea', text: 'Белое море', lat: 65.6, lon: 37.8, minZoom: 2.5 },
  { kind: 'sea', text: 'Баренцево море', lat: 72.0, lon: 42.0, minZoom: 1.5 },
  { kind: 'sea', text: 'Карское море', lat: 73.0, lon: 68.0, minZoom: 1.5 },
  { kind: 'sea', text: 'Чёрное море', lat: 43.3, lon: 34.2, minZoom: 1.5 },
  { kind: 'sea', text: 'Азовское море', lat: 46.1, lon: 36.6, minZoom: 5 },
  { kind: 'sea', text: 'Каспийское море', lat: 42.0, lon: 50.8, minZoom: 1.5 },
  { kind: 'sea', text: 'Ладожское озеро', lat: 60.9, lon: 31.6, minZoom: 6 },
  { kind: 'sea', text: 'Байкал', lat: 53.3, lon: 108.0, minZoom: 2 },
  { kind: 'sea', text: 'Охотское море', lat: 55.0, lon: 148.5, minZoom: 1 },
  { kind: 'sea', text: 'Тихий океан', lat: 45.0, lon: 160.0, minZoom: 1 },

  { kind: 'land', text: 'Россия', lat: 58.0, lon: 44.0, minZoom: 1, maxZoom: 3 },
  { kind: 'land', text: 'Сибирь', lat: 62.0, lon: 95.0, minZoom: 1, maxZoom: 4 },
  { kind: 'land', text: 'Швеция', lat: 60.5, lon: 15.5, minZoom: 1.5, maxZoom: 6 },
  { kind: 'land', text: 'Ливония', lat: 57.9, lon: 26.2, minZoom: 4, maxZoom: 10 },
  { kind: 'land', text: 'Речь Посполитая', lat: 52.2, lon: 23.0, minZoom: 2, maxZoom: 7 },
  { kind: 'land', text: 'Малороссия', lat: 49.6, lon: 33.0, minZoom: 4, maxZoom: 9 },
  { kind: 'land', text: 'Дикое поле', lat: 48.6, lon: 37.5, minZoom: 3, maxZoom: 8 },
  { kind: 'land', text: 'Крымское ханство', lat: 46.3, lon: 33.6, minZoom: 4, maxZoom: 9 },
  { kind: 'land', text: 'Османская империя', lat: 39.6, lon: 33.0, minZoom: 1.5, maxZoom: 6 },
  { kind: 'land', text: 'Персия', lat: 37.2, lon: 53.5, minZoom: 2, maxZoom: 6 },
  { kind: 'land', text: 'Поволжье', lat: 53.0, lon: 47.5, minZoom: 3, maxZoom: 7 },
  { kind: 'land', text: 'Урал', lat: 58.5, lon: 59.5, minZoom: 2, maxZoom: 6 },
  { kind: 'land', text: 'Монголия', lat: 46.8, lon: 103.0, minZoom: 1.5, maxZoom: 6 },
  { kind: 'land', text: 'Китай', lat: 39.5, lon: 113.0, minZoom: 1, maxZoom: 6 },
  { kind: 'land', text: 'Чукотка', lat: 66.5, lon: 171.0, minZoom: 2, maxZoom: 6 },
];
