// Карта 6 класса (Средние века): почти весь мир. События учебника идут
// от Мексики и Перу до Японии, а викинги доплывают до Ньюфаундленда.
// Файлом пользуются и страница, и сборщик контуров (tools/build-map.mjs).
// Поменял границы, ширину или реки — пересобери контуры: npm run build:map

export const MAP = {
  url: 'data/map-6.json',
  // На западе до Мексики, на востоке до Японии. На юге до Перу и юга Африки:
  // Австралии в учебнике нет, поэтому карта уже, чем у 8 класса
  bounds: { west: -125, east: 150, south: -38, north: 72 },
  // Ширина подобрана так, чтобы на градус приходилось столько же единиц
  // карты, сколько у карты 5 класса (1600 на 148°). Тогда предел приближения
  // в js/map/map-view.js значит для всех карт одно и то же
  width: 3000,
  // Первый кадр — Европа: там больше половины событий учебника
  home: { lon: 12, lat: 46 },
  // Поля описаны в js/data/class-5/map.js
  rivers: [
    { names: ['Rhine', 'Rhein'], label: 'Рейн', near: [7.0, 50.8], minZoom: 6 },
    { names: ['Danube', 'Donau'], label: 'Дунай', near: [23.2, 43.9], minZoom: 6 },
    { names: ['Seine'], label: 'Сена', near: [1.2, 49.3], minZoom: 10 },
    { names: ['Loire'], label: 'Луара', near: [0.5, 47.4], minZoom: 10 },
    { names: ['Dnipro', 'Dnepre'], label: 'Днепр', near: [32.0, 49.5], minZoom: 6 },
    { names: ['Volga'], label: 'Волга', near: [46.0, 50.5], minZoom: 6 },
    { names: ['Nile'], label: 'Нил', near: [32.9, 23.5], minZoom: 4 },
    { names: ['Tigris', 'Dicle'], label: 'Тигр', near: [43.5, 35.0], minZoom: 6 },
    { names: ['Euphrates', 'Firat', 'Al Furat'], label: 'Евфрат', near: [38.6, 35.9], minZoom: 6 },
    { names: ['Indus'], label: 'Инд', near: [70.8, 30.5], minZoom: 4 },
    { names: ['Ganges'], label: 'Ганг', near: [80.4, 26.5], minZoom: 4 },
    { names: ['Huang', 'Yellow'], label: 'Хуанхэ', near: [106.5, 38.5], minZoom: 4 },
    { names: ['Yangtze', 'Chang Jiang'], label: 'Янцзы', near: [107.5, 29.9], minZoom: 4 },
    { names: ['Niger'], label: 'Нигер', near: [-3.0, 16.5], minZoom: 4 },
  ],
};
