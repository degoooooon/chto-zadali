// Рассказы к событиям: что говорить на «3», на «4» и на «5».
// Как устроены записи — см. начало js/data/class-5/answers.js: поля
// basic, details, depth, terms и noTips здесь те же.
//
// Факты, имена и числа взяты из учебника, формулировки свои: текст учебника
// под авторским правом. Ключ записи — id события из events.js.

import { RUS_HORDE_ANSWERS } from './answers/rus-horde.js';
import { RUS_LANDS_ANSWERS } from './answers/rus-lands.js';
import { RUS_STATE_ANSWERS } from './answers/rus-state.js';
import { RUS_UNITED_ANSWERS } from './answers/rus-united.js';

export const ANSWERS = {
  ...RUS_STATE_ANSWERS,
  ...RUS_LANDS_ANSWERS,
  ...RUS_HORDE_ANSWERS,
  ...RUS_UNITED_ANSWERS,
};
