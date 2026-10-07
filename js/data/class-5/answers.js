// Рассказы к событиям: что говорить на «3», на «4» и на «5».
//
// Ответ собирается по нарастающей, как его и оценивают в школе:
//   basic   — на «3»: что произошло, где и когда;
//   details — на «4» к этому добавить: кто участвовал и как всё было;
//   depth   — на «5» к этому добавить: почему так случилось и к чему привело;
//   terms   — слова, которые на «5» надо уметь объяснить (поле необязательное).
// Три части подряд и есть полный рассказ о событии.
//
// Из terms всех рассказов складывается словарь подсказок: слово, объяснённое
// у одного события, подчёркивается в тексте всех рассказов сайта
// (js/data/prepare-glossary.js). Поэтому объяснение пиши так, чтобы оно
// годилось везде, а не только здесь.
//   noTips — слова, которые в этом рассказе подчёркивать не надо: значение
//            у них здесь другое, чем в словаре (поле необязательное).
//
// Факты, имена и числа взяты из учебника, формулировки свои: текст учебника
// под авторским правом. Ключ записи — id события из js/data/class-5/events.js.

import { EGYPT_ANSWERS } from './answers/egypt.js';
import { GREECE_ANSWERS } from './answers/greece.js';
import { INDIA_CHINA_ANSWERS } from './answers/india-china.js';
import { PREHISTORY_ANSWERS } from './answers/prehistory.js';
import { ROME_ANSWERS } from './answers/rome.js';
import { WEST_ASIA_ANSWERS } from './answers/west-asia.js';

export const ANSWERS = {
  ...PREHISTORY_ANSWERS,
  ...EGYPT_ANSWERS,
  ...WEST_ASIA_ANSWERS,
  ...INDIA_CHINA_ANSWERS,
  ...GREECE_ANSWERS,
  ...ROME_ANSWERS,
};
