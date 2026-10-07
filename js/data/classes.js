// Все учебники сайта по порядку. «Класс» в именах (CLASS_6, class-6-russia) —
// это один учебник со своей страницей, а не школьный класс: в 6 классе
// учебников два. Школьные классы с 5 по 11 перечислены
// в js/data/school-classes.js, предметы — в js/data/subjects.js.
//
// Список нужен только сборщикам из tools/: страницам, контурам карты
// и проверке словаря. Страница в браузере этот файл не подключает: она берёт
// один свой учебник (js/pages/class-N.js), грузить ей данные чужого незачем.

import { CLASS_5 } from './class-5/index.js';
import { CLASS_6 } from './class-6/index.js';
import { CLASS_6_RUSSIA } from './class-6-russia/index.js';
import { CLASS_7_RUSSIA } from './class-7-russia/index.js';
import { CLASS_8 } from './class-8/index.js';

export const CLASSES = [CLASS_5, CLASS_6, CLASS_6_RUSSIA, CLASS_7_RUSSIA, CLASS_8];
