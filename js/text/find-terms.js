// Ищет в тексте слова из словаря: «номов» — это «ном», «фараона» — «фараон».
//
// Русского языка правило не знает. Оно отрезает у слова из словаря окончание
// и разрешает на его месте любое из списка ниже. Поэтому оно может ошибиться
// в обе стороны: подчеркнуть чужое слово («тога» → «того») или не узнать
// своё («племя» → «племени»). Такие слова записаны формами целиком
// в word-forms.js своего класса (js/data/class-N/). Добавил слово в словарь или поправил рассказ —
// запусти npm run check:terms и просмотри найденные формы глазами.

const NOUN_ENDINGS = [
  'ами', 'ями',
  'ой', 'ей', 'ом', 'ем', 'ём', 'ам', 'ям', 'ах', 'ях', 'ов', 'ев', 'ью',
  'а', 'я', 'у', 'ю', 'о', 'е', 'ы', 'и', 'ь', 'й',
  '',
];
const ADJECTIVE_ENDINGS = [
  'ого', 'его', 'ому', 'ему', 'ыми', 'ими',
  'ый', 'ий', 'ой', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ым', 'им', 'ом', 'ем', 'ую', 'юю', 'ей', 'ых', 'их',
];

const LAST_VOWEL = /[аяоеыийь]$/;
const ADJECTIVE = /(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/;
const LETTER = 'а-яёА-ЯЁ';

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// С подчёркнутого слова может начинаться предложение: «Фараон правил…».
// Имена из словаря («Музей», «Эллада») ищем как записаны: музей с маленькой
// буквы — это уже не тот Музей, что в Александрии
const anyCase = (text) => {
  const first = text[0];

  return first === first.toUpperCase() ? escape(text) : `[${first}${first.toUpperCase()}]${escape(text.slice(1))}`;
};

// В словах из двух частей первое — прилагательное, склоняются оба:
// «наскальные рисунки» → «наскальных рисунков»
const byRule = (term) => {
  const words = term.split(' ');

  return words
    .map((word, index) => {
      const isAdjective = index < words.length - 1 && ADJECTIVE.test(word);
      const stem = isAdjective ? word.slice(0, -2) : word.replace(LAST_VOWEL, '');
      const endings = isAdjective ? ADJECTIVE_ENDINGS : NOUN_ENDINGS;

      return `${index === 0 ? anyCase(stem) : escape(stem)}(?:${endings.join('|')})`;
    })
    .join(' ');
};

// Сначала длинные: иначе «город» из «городов-государств» займёт место раньше
const byForms = (forms) =>
  [...forms]
    .sort((a, b) => b.length - a.length)
    .map(anyCase)
    .join('|');

// glossary — список { term, meaning, forms } из js/data/prepare-glossary.js.
// Возвращает функцию, которая режет текст на куски: обычный { text }
// и слово из словаря { text, term, meaning }.
// seen — слова, которые в этом рассказе уже подчёркнуты: подчёркиваем только
// первое упоминание, иначе «фараон» пестрит в каждой строке. Функция сама
// дописывает в seen найденное
export const createTermFinder = (glossary) => {
  // Длинные слова вперёд: «сатрапия» должна пробоваться раньше, чем «сатрап»
  const entries = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const groups = entries.map(({ term, forms }) => `(${forms ? byForms(forms) : byRule(term)})`);
  // Границы слова: без них «ном» нашёлся бы внутри «астрономии».
  // \b здесь не годится, он понимает только латиницу
  const pattern = new RegExp(`(?<![${LETTER}])(?:${groups.join('|')})(?![${LETTER}])`, 'g');

  return (text, seen = new Set()) => {
    // Пустой словарь дал бы выражение, которое совпадает с пустотой
    // между любыми двумя буквами
    if (!entries.length) {
      return [{ text }];
    }

    const parts = [];
    let from = 0;

    for (const match of text.matchAll(pattern)) {
      const { term, meaning } = entries[match.findIndex((group, index) => index > 0 && group !== undefined) - 1];

      if (seen.has(term)) {
        continue;
      }

      seen.add(term);
      if (match.index > from) {
        parts.push({ text: text.slice(from, match.index) });
      }
      parts.push({ text: match[0], term, meaning });
      from = match.index + match[0].length;
    }
    if (from < text.length) {
      parts.push({ text: text.slice(from) });
    }

    return parts;
  };
};
