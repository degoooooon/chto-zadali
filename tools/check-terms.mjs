// Показывает, какие слова в рассказах получат подсказку.
// Запуск: npm run check:terms          — все классы
//         npm run check:terms -- 8     — только 8 класс
//
// Зачем: слова в тексте ищет правило, которое знает только окончания
// (js/text/find-terms.js). Проверить его может только человек: просмотреть
// список и убедиться, что рядом со словом «тога» не стоит «того».
// Чужую форму лечит запись в word-forms.js класса.

import { CLASSES } from '../js/data/classes.js';
import { prepareGlossary } from '../js/data/prepare-glossary.js';
import { createTermFinder } from '../js/text/find-terms.js';

const EVENT_PARTS = ['basic', 'details', 'depth'];
const PARAGRAPH_PARTS = ['lead', 'more', 'deeper', 'summary'];

// На сайте подчёркивается только первое упоминание в рассказе. Здесь нужны
// все: чужая форма может стоять и вторым упоминанием. Поэтому вместо списка
// «уже видели» подставляем такой, который ничего не запоминает
// и отсеивает только слова из noTips этого рассказа
const onlySkipping = (noTips = []) => ({ has: (term) => noTips.includes(term), add: () => {} });

const check = ({ id: classId, answers, retellings, wordForms }) => {
  const glossary = prepareGlossary({ answers, retellings, forms: wordForms });
  const find = createTermFinder(glossary);

  console.log(`\n===== ${classId} класс =====\n`);

  const stories = [
    ...Object.entries(answers).map(([id, answer]) => [id, answer, EVENT_PARTS]),
    ...Object.entries(retellings).map(([id, retelling]) => [`§ ${id}`, retelling, PARAGRAPH_PARTS]),
  ];

  const found = new Map(glossary.map(({ term }) => [term, { forms: new Map(), stories: new Set() }]));

  for (const [id, record, keys] of stories) {
    for (const text of keys.map((key) => record[key]).filter(Boolean)) {
      for (const part of find(text, onlySkipping(record.noTips))) {
        if (part.term) {
          const { forms, stories: where } = found.get(part.term);

          forms.set(part.text, (forms.get(part.text) ?? 0) + 1);
          where.add(id);
        }
      }
    }
  }

  const missing = [];

  for (const { term, meaning, forms: fixedForms } of glossary) {
    const { forms, stories: where } = found.get(term);

    if (!forms.size) {
      missing.push(term);
      continue;
    }

    const list = [...forms].map(([form, count]) => (count > 1 ? `${form} ×${count}` : form)).join(', ');

    console.log(`${term}${fixedForms ? ' (по списку форм)' : ''} — ${meaning}`);
    console.log(`    ${list}`);
    console.log(`    рассказов: ${where.size}`);
  }

  console.log(`\nСлов в словаре: ${glossary.length}. Нашлись в текстах: ${glossary.length - missing.length}.`);
  if (missing.length) {
    console.log(`Ни разу не встретились (подсказки у них не будет): ${missing.join(', ')}`);
  }
};

const wanted = process.argv[2];
const chosen = CLASSES.filter(({ id }) => !wanted || id === wanted);

// Опечатка в номере класса иначе выглядит как «всё проверено, ошибок нет»
if (!chosen.length) {
  console.error(`Класса «${wanted}» нет. Есть: ${CLASSES.map(({ id }) => id).join(', ')}`);
  process.exit(1);
}

chosen.forEach(check);
