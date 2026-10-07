// Собирает все страницы сайта из шаблонов. Запуск: npm run build:pages
//
// Страниц три вида:
//   index.html             — «Какой у тебя класс?», плитки с 5 по 11
//   N-klass.html           — предметы N класса
//   N-klass-istoriya.html  — учебник: карта, лента времени и рассказы
//
// Первые две — страницы выбора, шаблон у них один: tools/hub-template.html.
// Разметка учебника лежит в tools/page-template.html, а тексты, которые
// зависят от учебника, — в js/data/class-N/page.js. Без сборки разметку
// пришлось бы держать копией в каждой странице: поправил блок в одной,
// забыл в другой.
//
// Готовые страницы руками не правим: следующая сборка всё затрёт.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { CLASSES } from '../js/data/classes.js';
import { SCHOOL_CLASSES } from '../js/data/school-classes.js';
import { SUBJECTS } from '../js/data/subjects.js';
import { plural } from '../js/text/plural.js';
import { escapeHtml, fillTemplate } from './template.mjs';

const SITE_ROOT = new URL('../', import.meta.url);
const HOME_FILE = 'index.html';
const SUBJECT_FORMS = ['предмет', 'предмета', 'предметов'];

const readTool = async (name) => (await readFile(new URL(name, import.meta.url), 'utf8')).trimEnd();

const schoolClassFile = (schoolClass) => `${schoolClass}-klass.html`;

const subjectsById = new Map(SUBJECTS.map((subject) => [subject.id, subject]));
const subjectOrder = new Map(SUBJECTS.map((subject, index) => [subject.id, index]));

// Учебник без класса или с опечаткой в предмете собрался бы, но не попал
// ни в один список: страница есть, а дойти до неё с главной нельзя
for (const { id, page } of CLASSES) {
  if (!SCHOOL_CLASSES.includes(page.schoolClass)) {
    throw new Error(`class-${id}: класса «${page.schoolClass}» нет в js/data/school-classes.js`);
  }
  if (!subjectsById.has(page.subject)) {
    throw new Error(`class-${id}: предмета «${page.subject}» нет в js/data/subjects.js`);
  }
}

// Учебники одного школьного класса: по предметам, как в subjects.js,
// внутри предмета — как в classes.js
const getBooks = (schoolClass) =>
  CLASSES.map(({ page }) => page)
    .filter((page) => page.schoolClass === schoolClass)
    .sort((a, b) => subjectOrder.get(a.subject) - subjectOrder.get(b.subject));

const readySchoolClasses = SCHOOL_CLASSES.filter((schoolClass) => getBooks(schoolClass).length);

// Подпись под номером класса на плитке. Один предмет называем по имени,
// несколько — считаем: в плитку шириной с палец список не влезет
const describeSchoolClass = (books) => {
  const subjectIds = [...new Set(books.map((page) => page.subject))];

  if (!subjectIds.length) {
    return 'пока пусто';
  }

  return subjectIds.length === 1
    ? subjectsById.get(subjectIds[0]).title.toLowerCase()
    : `${subjectIds.length} ${plural(subjectIds.length, SUBJECT_FORMS)}`;
};

const buildClassList = (schoolClasses) =>
  [
    '      <ul class="class-list">',
    ...schoolClasses.map((schoolClass) => {
      const books = getBooks(schoolClass);
      const linkClass = `class-list__link${books.length ? '' : ' class-list__link--empty'}`;

      return [
        '        <li class="class-list__item">',
        `          <a class="${linkClass}" href="${schoolClassFile(schoolClass)}">`,
        `            <span class="class-list__number">${schoolClass}</span>`,
        '            <span class="class-list__word">класс</span>',
        `            <span class="class-list__note">${escapeHtml(describeSchoolClass(books))}</span>`,
        '          </a>',
        '        </li>',
      ].join('\n');
    }),
    '      </ul>',
  ].join('\n');

const buildSubjectList = (books) =>
  [
    '      <ul class="subject-list">',
    ...books.map((page) =>
      [
        '        <li class="subject-list__item">',
        `          <a class="subject-list__link" href="${escapeHtml(page.file)}">`,
        `            <span class="subject-list__name">${escapeHtml(subjectsById.get(page.subject).title)}</span>`,
        `            <span class="subject-list__book">${escapeHtml(page.book)}</span>`,
        '          </a>',
        '        </li>',
      ].join('\n'),
    ),
    '      </ul>',
  ].join('\n');

// Шапка учебника: ссылка назад к предметам класса и название предмета.
// Учебник, на котором человек сейчас, в ней тоже ссылка: так его читает
// скринридер («текущая страница»)
const buildClassNav = (current) => {
  const { title } = subjectsById.get(current.subject);
  const sameSubject = getBooks(current.schoolClass).filter((page) => page.subject === current.subject);
  const back = `          <a class="class-nav__link" href="${schoolClassFile(current.schoolClass)}">← ${current.schoolClass} класс</a>`;

  // Учебник у предмета один: переключать нечего, хватает названия предмета
  if (sameSubject.length === 1) {
    return [back, `          <span class="class-nav__label">${escapeHtml(title)}</span>`].join('\n');
  }

  return [
    back,
    `          <span class="class-nav__label">${escapeHtml(title)}:</span>`,
    ...sameSubject.map((page) => {
      const isCurrent = page === current;
      const className = `class-nav__link${isCurrent ? ' class-nav__link--current' : ''}`;

      return `          <a class="${className}" href="${escapeHtml(page.file)}"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(page.book)}</a>`;
    }),
  ].join('\n');
};

const buildTimelineNotes = ({ timelineNote, timelineExtraNote }) =>
  [
    `        <p class="timeline__note">${escapeHtml(timelineNote)}</p>`,
    // Вторая подпись есть не у всех: у ленты XVIII века пояснять нечего
    timelineExtraNote && `        <p class="timeline__note timeline__note--extra">${escapeHtml(timelineExtraNote)}</p>`,
  ]
    .filter(Boolean)
    .join('\n');

const [bookTemplate, hubTemplate, fonts, privacy] = await Promise.all([
  readTool('./page-template.html'),
  readTool('./hub-template.html'),
  readTool('./parts/fonts.html'),
  readTool('./parts/privacy.html'),
]);

const HUB_NOTE = '<!-- Страница собрана: npm run build:pages. Правь tools/hub-template.html и tools/build-pages.mjs, а не этот файл -->';

const buildHome = () => ({
  file: HOME_FILE,
  what: 'выбор класса',
  html: fillTemplate(hubTemplate, {
    generatedNote: HUB_NOTE,
    documentTitle: 'Что задали? Параграфы учебника коротко и на оценку',
    description: escapeHtml('Выбери класс, предмет и параграф, который задали. Сайт коротко перескажет параграф и подскажет, как рассказать его на «3», на «4» и на «5».'),
    fonts,
    crumbs: '',
    title: 'Какой у тебя класс?',
    lead: escapeHtml('Выбери класс, потом предмет и параграф, который задали. Сайт коротко перескажет параграф и подскажет, как рассказать его на «3», на «4» и на «5».'),
    list: buildClassList(SCHOOL_CLASSES),
    privacy,
  }),
});

const buildSchoolClass = (schoolClass) => {
  const books = getBooks(schoolClass);
  const subjectTitles = [...new Set(books.map((page) => subjectsById.get(page.subject).title.toLowerCase()))];
  // Класс, для которого ещё ничего нет: вместо пустого места показываем
  // классы, где параграфы уже есть
  const texts = books.length
    ? {
        description: `Предметы ${schoolClass} класса: ${subjectTitles.join(', ')}. Выбери предмет и параграф, который задали.`,
        lead: 'Выбери предмет, по которому задали параграф.',
        list: buildSubjectList(books),
      }
    : {
        description: `Для ${schoolClass} класса на сайте пока ничего нет.`,
        lead: `Для ${schoolClass} класса пока ничего нет. Параграфы уже есть для этих классов:`,
        list: buildClassList(readySchoolClasses),
      };

  return {
    file: schoolClassFile(schoolClass),
    what: books.length ? `предметы ${schoolClass} класса` : `${schoolClass} класс, пока пусто`,
    html: fillTemplate(hubTemplate, {
      generatedNote: HUB_NOTE,
      documentTitle: `${schoolClass} класс: выбери предмет`,
      description: escapeHtml(texts.description),
      fonts,
      crumbs: [
        '      <nav class="class-nav hub__crumbs" aria-label="Назад">',
        `        <a class="class-nav__link" href="${HOME_FILE}">← Все классы</a>`,
        '      </nav>',
      ].join('\n'),
      title: `${schoolClass} класс`,
      lead: escapeHtml(texts.lead),
      list: texts.list,
      privacy,
    }),
  };
};

const buildBook = ({ id, page }) => ({
  file: page.file,
  what: `учебник class-${id}`,
  html: fillTemplate(bookTemplate, {
    generatedNote: '<!-- Страница собрана: npm run build:pages. Правь tools/page-template.html и js/data/class-N/page.js, а не этот файл -->',
    documentTitle: escapeHtml(page.documentTitle),
    description: escapeHtml(page.description),
    fonts,
    entry: `js/pages/class-${id}.js`,
    title: escapeHtml(page.title),
    classNav: buildClassNav(page),
    mapLabel: escapeHtml(page.mapLabel),
    timelineNotes: buildTimelineNotes(page),
    source: escapeHtml(page.source),
    privacy,
  }),
});

const pages = [buildHome(), ...SCHOOL_CLASSES.map(buildSchoolClass), ...CLASSES.map(buildBook)];

// Проверяем до записи, а не во время: иначе половина сайта уже пересобрана,
// а вторая осталась старой. Два учебника с одним именем файла (или учебник
// с именем страницы класса, «6-klass.html») молча затёрли бы друг друга
const owners = new Map();

for (const { file, what } of pages) {
  if (owners.has(file)) {
    throw new Error(`Файл ${file} собирается дважды: ${owners.get(file)} и ${what}`);
  }
  owners.set(file, what);
}

for (const { file, what, html } of pages) {
  await writeFile(new URL(file, SITE_ROOT), html + '\n');
  console.log(`${file}: ${what}, ${html.split('\n').length} строк`);
}

// Переименовал страницу в page.js — старый файл остаётся в корне и открывается
// по прежнему адресу со старым содержимым. Гита в проекте нет, заметить
// такое больше некому
const stale = (await readdir(SITE_ROOT)).filter((name) => name.endsWith('.html') && !owners.has(name));

if (stale.length) {
  console.warn(`\nВ корне лежат страницы, которые сборка не делала: ${stale.join(', ')}. Если это старые имена, удали их.`);
}
