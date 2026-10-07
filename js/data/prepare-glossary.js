// Собирает словарь для подсказок в тексте рассказов.
//
// Своих слов у словаря нет: он складывается из полей terms в рассказах
// о событиях (answers.js класса) и в пересказах параграфов
// (retellings.js класса). Слово, объяснённое у одного события,
// подсказывается во всех рассказах, где оно встречается.

const isPair = (pair) =>
  Array.isArray(pair) && pair.length === 2 && pair.every((part) => typeof part === 'string' && part.trim());

// answers и retellings — записи с необязательным полем terms: [[слово, объяснение]].
// forms — слова, которые ищем по списку форм (word-forms.js класса)
export const prepareGlossary = ({ answers, retellings, forms }) => {
  const glossary = new Map();
  const sources = [['answers.js', answers], ['retellings.js', retellings]];

  for (const [source, records] of sources) {
    for (const [id, record] of Object.entries(records)) {
      for (const pair of record.terms ?? []) {
        if (!isPair(pair)) {
          console.warn(`${source}, «${id}»: слово в terms записано не как [слово, объяснение], пропущено`);
          continue;
        }

        const [term, meaning] = pair;
        const known = glossary.get(term);

        // Подсказка у слова одна на весь сайт. Два объяснения — и в одном
        // рассказе всплывёт то, что написано для другого
        if (known && known.meaning !== meaning) {
          console.warn(`${source}, «${id}»: у слова «${term}» уже есть другое объяснение, в подсказке останется первое`);
          continue;
        }

        glossary.set(term, { term, meaning, forms: forms[term] });
      }
    }
  }

  // Слово в рассказе переименовали, а формы остались под старым именем:
  // подсказка молча вернётся к общему правилу и снова начнёт ошибаться
  for (const term of Object.keys(forms)) {
    if (!glossary.has(term)) {
      console.warn(`word-forms.js: слова «${term}» нет ни в одном terms, его формы не используются`);
    }
  }

  // То же с noTips: опечатка в слове — и запрет перестаёт действовать
  for (const [source, records] of sources) {
    for (const [id, record] of Object.entries(records)) {
      for (const term of record.noTips ?? []) {
        if (!glossary.has(term)) {
          console.warn(`${source}, «${id}»: в noTips стоит «${term}», а в словаре такого слова нет`);
        }
      }
    }
  }

  return [...glossary.values()];
};
