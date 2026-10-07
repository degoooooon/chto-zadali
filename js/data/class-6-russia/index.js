// Всё про 6 класс (история России) одним объектом: его берут страница
// (js/pages/class-6-russia.js) и сборщики (tools/). Поля читает движок, js/app.js.

import { ANSWERS } from './answers.js';
import { ERAS } from './eras.js';
import { EVENTS } from './events.js';
import { MAP } from './map.js';
import { MAP_LABELS } from './map-labels.js';
import { PAGE } from './page.js';
import { PARAGRAPHS } from './paragraphs.js';
import { PLACES } from './places.js';
import { RETELLINGS } from './retellings.js';
import { TIMELINE } from './timeline.js';
import { WORD_FORMS } from './word-forms.js';

export const CLASS_6_RUSSIA = {
  // По id называются папка данных (js/data/class-6-russia)
  // и страница (js/pages/class-6-russia.js)
  id: '6-russia',
  answers: ANSWERS,
  eras: ERAS,
  events: EVENTS,
  map: MAP,
  mapLabels: MAP_LABELS,
  page: PAGE,
  paragraphs: PARAGRAPHS,
  places: PLACES,
  retellings: RETELLINGS,
  timeline: TIMELINE,
  wordForms: WORD_FORMS,
};
