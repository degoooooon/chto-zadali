// Рассказы к событиям: что говорить на «3», на «4» и на «5».
// Как устроены записи — см. начало js/data/class-5/answers.js: поля
// basic, details, depth, terms и noTips здесь те же.
//
// Факты, имена и числа взяты из учебника, формулировки свои: текст учебника
// под авторским правом. Ключ записи — id события из events.js.

import { CHANGES_ANSWERS } from './answers/changes.js';
import { REVOLUTIONS_ANSWERS } from './answers/revolutions.js';
import { WORLD_ANSWERS } from './answers/world.js';

export const ANSWERS = {
  ...CHANGES_ANSWERS,
  ...REVOLUTIONS_ANSWERS,
  ...WORLD_ANSWERS,
};
