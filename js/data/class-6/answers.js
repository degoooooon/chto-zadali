// Рассказы к событиям: что говорить на «3», на «4» и на «5».
// Как устроены записи — см. начало js/data/class-5/answers.js: поля
// basic, details, depth, terms и noTips здесь те же.
//
// Факты, имена и числа взяты из учебника, формулировки свои: текст учебника
// под авторским правом. Ключ записи — id события из events.js.

import { AUTUMN_ANSWERS } from './answers/autumn.js';
import { BEYOND_EUROPE_ANSWERS } from './answers/beyond-europe.js';
import { EARLY_EUROPE_ANSWERS } from './answers/early-europe.js';
import { HEYDAY_ANSWERS } from './answers/heyday.js';
import { ISLAM_ANSWERS } from './answers/islam.js';
import { SOCIETY_ANSWERS } from './answers/society.js';

export const ANSWERS = {
  ...EARLY_EUROPE_ANSWERS,
  ...ISLAM_ANSWERS,
  ...SOCIETY_ANSWERS,
  ...HEYDAY_ANSWERS,
  ...BEYOND_EUROPE_ANSWERS,
  ...AUTUMN_ANSWERS,
};
