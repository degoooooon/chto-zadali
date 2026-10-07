// Места на карте. Координаты записаны только здесь: события ссылаются
// на место по id, поэтому шестнадцать событий в Риме не могут разъехаться.
//
// name — как место называлось тогда, now — где это сегодня.
// lat/lon — градусы, северная широта и восточная долгота с плюсом.
// Координаты в учебнике не даны, они взяты из географии и округлены.

export const PLACES = {
  olduvai: { name: 'Олдувайское ущелье', now: 'Танзания, Восточная Африка', lat: -2.99, lon: 35.35 },
  altamira: { name: 'Пещера Альтамира', now: 'Испания', lat: 43.38, lon: -4.12 },
  kapova: { name: 'Капова пещера', now: 'Россия, Башкирия', lat: 53.04, lon: 57.07 },

  memphis: { name: 'Мемфис', now: 'Египет', lat: 29.85, lon: 31.25 },
  giza: { name: 'Гиза', now: 'Египет, окраина Каира', lat: 29.98, lon: 31.13 },
  thebes: { name: 'Фивы', now: 'Египет, город Луксор', lat: 25.7, lon: 32.64 },

  ur: { name: 'Ур', now: 'Ирак', lat: 30.96, lon: 46.1 },
  babylon: { name: 'Вавилон', now: 'Ирак', lat: 32.54, lon: 44.42 },
  tyre: { name: 'Тир', now: 'Ливан', lat: 33.27, lon: 35.2 },
  jerusalem: { name: 'Иерусалим', now: 'Израиль и Палестина', lat: 31.78, lon: 35.23 },
  nineveh: { name: 'Ниневия', now: 'Ирак, город Мосул', lat: 36.36, lon: 43.15 },
  persepolis: { name: 'Персеполь', now: 'Иран', lat: 29.93, lon: 52.89 },

  mohenjoDaro: { name: 'Мохенджо-Даро', now: 'Пакистан', lat: 27.33, lon: 68.14 },
  pataliputra: { name: 'Паталипутра', now: 'Индия, город Патна', lat: 25.61, lon: 85.14 },
  qufu: { name: 'Царство Лу', now: 'Китай, город Цюйфу', lat: 35.6, lon: 116.99 },
  xianyang: { name: 'Сяньян', now: 'Китай', lat: 34.33, lon: 108.71 },
  samarkand: { name: 'Мараканда', now: 'Узбекистан, город Самарканд', lat: 39.65, lon: 66.96 },

  knossos: { name: 'Кносс', now: 'Греция, остров Крит', lat: 35.3, lon: 25.16 },
  mycenae: { name: 'Микены', now: 'Греция', lat: 37.73, lon: 22.76 },
  troy: { name: 'Троя', now: 'Турция', lat: 39.96, lon: 26.24 },
  olympia: { name: 'Олимпия', now: 'Греция', lat: 37.64, lon: 21.63 },
  panticapaeum: { name: 'Пантикапей', now: 'Крым, город Керчь', lat: 45.35, lon: 36.47 },
  athens: { name: 'Афины', now: 'Греция', lat: 37.97, lon: 23.73 },
  sparta: { name: 'Спарта', now: 'Греция', lat: 37.07, lon: 22.43 },
  marathon: { name: 'Марафон', now: 'Греция', lat: 38.15, lon: 23.96 },
  thermopylae: { name: 'Фермопилы', now: 'Греция', lat: 38.8, lon: 22.54 },
  salamis: { name: 'Остров Саламин', now: 'Греция', lat: 37.95, lon: 23.5 },
  plataea: { name: 'Платеи', now: 'Греция', lat: 38.22, lon: 23.27 },
  chaeronea: { name: 'Херонея', now: 'Греция', lat: 38.49, lon: 22.84 },
  granicus: { name: 'Река Граник', now: 'Турция', lat: 40.32, lon: 27.28 },
  issus: { name: 'Исс', now: 'Турция', lat: 36.84, lon: 36.21 },
  alexandria: { name: 'Александрия', now: 'Египет', lat: 31.2, lon: 29.92 },
  gaugamela: { name: 'Гавгамелы', now: 'Ирак', lat: 36.56, lon: 43.44 },

  rome: { name: 'Рим', now: 'Италия', lat: 41.9, lon: 12.48 },
  sentinum: { name: 'Сентин', now: 'Италия', lat: 43.42, lon: 12.93 },
  beneventum: { name: 'Беневент', now: 'Италия', lat: 41.13, lon: 14.78 },
  sicily: { name: 'Сицилия', now: 'Италия', lat: 37.6, lon: 14.2 },
  alps: { name: 'Альпы', now: 'граница Франции и Италии', lat: 45.1, lon: 6.7 },
  cannae: { name: 'Канны', now: 'Италия', lat: 41.31, lon: 16.13 },
  zama: { name: 'Зама', now: 'Тунис', lat: 36.3, lon: 9.45 },
  cynoscephalae: { name: 'Киноскефалы', now: 'Греция', lat: 39.42, lon: 22.57 },
  pydna: { name: 'Пидна', now: 'Греция', lat: 40.37, lon: 22.61 },
  carthage: { name: 'Карфаген', now: 'Тунис', lat: 36.85, lon: 10.32 },
  capua: { name: 'Капуя', now: 'Италия', lat: 41.08, lon: 14.25 },
  rubicon: { name: 'Река Рубикон', now: 'Италия', lat: 44.09, lon: 12.4 },
  actium: { name: 'Мыс Акций', now: 'Греция', lat: 38.95, lon: 20.75 },
  pompeii: { name: 'Помпеи', now: 'Италия', lat: 40.75, lon: 14.49 },
  dacia: { name: 'Дакия', now: 'Румыния', lat: 45.62, lon: 23.31 },
  mediolanum: { name: 'Медиолан', now: 'Италия, город Милан', lat: 45.46, lon: 9.19 },
  constantinople: { name: 'Константинополь', now: 'Турция, город Стамбул', lat: 41.01, lon: 28.98 },
  catalaunian: { name: 'Каталаунские поля', now: 'Франция', lat: 48.95, lon: 4.36 },
};
