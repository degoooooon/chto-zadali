// Рассказы к событиям: что говорить на «3», на «4» и на «5».
// Как устроены записи — см. начало js/data/class-5/answers.js: поля
// basic, details, depth, terms и noTips здесь те же.
//
// Факты, имена и числа взяты из учебника, формулировки свои: текст учебника
// под авторским правом. Ключ записи — id события из events.js.

import { ROMANOVS_ANSWERS } from './answers/romanovs.js';
import { RUSSIA_16_ANSWERS } from './answers/russia-16.js';
import { SMUTA_ANSWERS } from './answers/smuta.js';

export const ANSWERS = {
  ...RUSSIA_16_ANSWERS,
  ...SMUTA_ANSWERS,
  ...ROMANOVS_ANSWERS,
};
