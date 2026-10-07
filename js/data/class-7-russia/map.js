// Карта 7 класса (история России): от Балтики до Тихого океана.
// Файлом пользуются и страница, и сборщик контуров (tools/build-map.mjs).
// Поменял границы, ширину или реки — пересобери контуры: npm run build:map

export const MAP = {
  url: 'data/map-7-russia.json',
  // На западе до Швеции и Польши: Ливонская война, Люблин, Рига.
  // На востоке до 180-го меридиана: дальше исходник режет Чукотку, а устье
  // Анадыря, куда вышел Дежнёв, ещё помещается. На юге до южного берега
  // Каспия (поход Разина) и Северного Китая, на севере до Таймыра
  bounds: { west: 12, east: 180, south: 36, north: 74 },
  // Ширина подобрана так, чтобы на градус приходилось столько же единиц
  // карты, сколько у карты 5 класса (1600 на 148°). Тогда предел приближения
  // в js/map/map-view.js значит для всех карт одно и то же
  width: 1815,
  // Первый кадр — Москва и земли вокруг: там больше половины событий
  home: { lon: 38, lat: 55.5 },
  // Поля описаны в js/data/class-5/map.js. Оки и Волхова в исходниках
  // Natural Earth нет, поэтому на карте их тоже нет
  rivers: [
    { names: ['Volga'], label: 'Волга', near: [46.2, 50.2], minZoom: 2 },
    { names: ['Don'], label: 'Дон', near: [40.2, 49.6], minZoom: 3 },
    { names: ['Dnieper'], label: 'Днепр', near: [32.2, 49.3], minZoom: 3 },
    { names: ['Kama'], label: 'Кама', near: [52.5, 56.2], minZoom: 3 },
    { names: ['Severnaya Dvina'], label: 'Северная Двина', near: [43.5, 62.5], minZoom: 3 },
    // В исходнике река записана латышским именем, а английское имя у неё русское
    { names: ['Zapadnaya Dvina'], label: 'Западная Двина', near: [27.5, 55.6], minZoom: 5 },
    { names: ['Neva'], label: 'Нева', near: [30.9, 59.8], minZoom: 8 },
    { names: ['Pechora'], label: 'Печора', near: [56.5, 65.0], minZoom: 3 },
    { names: ['Ural'], label: 'Урал (Яик)', near: [52.0, 50.0], minZoom: 3 },
    { names: ['Tobol'], label: 'Тобол', near: [66.5, 56.5], minZoom: 3 },
    { names: ['Irtysh'], label: 'Иртыш', near: [73.5, 55.5], minZoom: 2 },
    { names: ['Ob'], label: 'Обь', near: [78.5, 60.5], minZoom: 1.5 },
    { names: ['Yenisey'], label: 'Енисей', near: [88.5, 64.0], minZoom: 1.5 },
    { names: ['Angara'], label: 'Ангара', near: [100.5, 57.5], minZoom: 2 },
    { names: ['Lena'], label: 'Лена', near: [122.0, 61.0], minZoom: 1.5 },
    { names: ['Indigirka'], label: 'Индигирка', near: [146.0, 68.5], minZoom: 2 },
    { names: ['Kolyma'], label: 'Колыма', near: [155.0, 66.5], minZoom: 2 },
    { names: ['Anadyr’'], label: 'Анадырь', near: [172.0, 65.0], minZoom: 2 },
    { names: ['Amur'], label: 'Амур', near: [130.0, 48.5], minZoom: 1.5 },
  ],
};
