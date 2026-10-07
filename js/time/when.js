// Всё про «когда»: как показать дату словами, какой это век
// и какой отрезок событие занимает на ленте времени.
// Формы записи даты описаны в начале events.js класса (js/data/class-5/events.js).

const ROMAN = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

const toRoman = (number) => {
  let rest = number;
  let result = '';

  for (const [value, letters] of ROMAN) {
    while (rest >= value) {
      result += letters;
      rest -= value;
    }
  }

  return result;
};

// 500 г. до н.э. — это ещё V век (500–401), а 501-й уже VI. Поэтому
// округляем вверх, а не делим нацело: иначе круглые годы попадут не в свой век
const centuryOfYear = (year) => Math.sign(year) * Math.ceil(Math.abs(year) / 100);

// «н.э.» пишем только там, где без неё дату можно принять за «до н.э.»:
// у первых веков нашей эры. «1789 г. н.э.» не пишет ни один учебник
const LAST_MARKED_CENTURY = 10;

// Спутать эры можно только на странице, где есть обе: в Древнем мире.
// В Средних веках дат до нашей эры нет совсем, и без этой настройки
// карточка писала бы «732 г. н.э.» рядом с «1066 г.». Страница сообщает
// о себе один раз при запуске (js/app.js), до первой отрисовки
let hasDatesBeforeOurEra = true;

export const setDatesBeforeOurEra = (value) => {
  hasDatesBeforeOurEra = value;
};

const eraOfCentury = (century) => {
  if (century < 0) {
    return 'до н.э.';
  }

  return hasDatesBeforeOurEra && century <= LAST_MARKED_CENTURY ? 'н.э.' : '';
};

const eraOfYear = (year) => eraOfCentury(centuryOfYear(year));

// Неразрывные пробелы: без них «г.» и «до н.э.» уезжают на новую строку
// отдельно от числа, и в узкой карточке дата читается как два куска
const NBSP = ' ';
// Эры может не быть (см. выше), тогда и пробела перед ней быть не должно
const glue = (...parts) => parts.filter(Boolean).join(' ').replaceAll(' ', NBSP);

export const NO_DATE = 'в учебнике даты нет';

export const isDated = (when) => Boolean(when);

export const isPrehistoric = (when) => isDated(when) && 'yearsAgo' in when;

const formatYearsAgo = ({ yearsAgo, prefix = 'около' }) => {
  const [value, unit] = yearsAgo >= 1000000 ? [yearsAgo / 1000000, 'млн'] : [yearsAgo / 1000, 'тыс.'];
  // По-русски дробь пишут через запятую: «2,5 млн», а не «2.5 млн»
  const number = String(value).replace('.', ',');

  return glue(`${prefix} ${number} ${unit} лет назад`);
};

// part — «начало», «середина» или «конец», как сказано в учебнике
const formatPeriod = ({ number, numberTo, part, approx }, [one, genitive, many], era) => {
  const roman = toRoman(Math.abs(number));

  if (numberTo !== undefined) {
    return glue(`${roman}–${toRoman(Math.abs(numberTo))} ${many}`, era);
  }
  if (part) {
    return glue(`${part} ${roman} ${genitive}`, era);
  }

  return glue(`${approx ? 'примерно ' : ''}${roman} ${one}`, era);
};

const CENTURY_FORMS = ['век', 'века', 'века'];
const MILLENNIUM_FORMS = ['тысячелетие', 'тысячелетия', 'тысячелетия'];

const formatCentury = ({ century, centuryTo, part, approx }) =>
  formatPeriod({ number: century, numberTo: centuryTo, part, approx }, CENTURY_FORMS, eraOfCentury(century));

const formatYear = ({ year, yearTo, approx }) => {
  const start = approx ? 'около ' : '';

  if (yearTo === undefined) {
    return glue(`${start}${Math.abs(year)} г.`, eraOfYear(year));
  }

  return glue(`${start}${Math.abs(year)}–${Math.abs(yearTo)} гг.`, eraOfYear(year));
};

export const formatWhen = (when) => {
  if (!isDated(when)) {
    return NO_DATE;
  }
  if ('yearsAgo' in when) {
    return formatYearsAgo(when);
  }
  if ('millennium' in when) {
    // Тысячелетия в учебниках встречаются только до нашей эры
    return formatPeriod({ number: when.millennium, part: when.part }, MILLENNIUM_FORMS, 'до н.э.');
  }
  if ('century' in when) {
    return formatCentury(when);
  }

  return formatYear(when);
};

// Подпись года на оси ленты: коротко, без «г.». Года «ноль» не было,
// поэтому на его месте стоит первый год нашей эры
export const formatAxisYear = (year) =>
  year === 0 ? '1 г. н.э.' : [Math.abs(year), eraOfYear(year)].filter(Boolean).join(' ');

// Числа, которыми дата записана в тексте: «490», «VIII», «2,5».
// По ним проверяем, что рассказ называет ту же дату, что стоит в событии
export const toDateTokens = (when) => {
  if ('yearsAgo' in when) {
    const value = when.yearsAgo >= 1000000 ? when.yearsAgo / 1000000 : when.yearsAgo / 1000;

    return [String(value).replace('.', ',')];
  }
  if ('millennium' in when) {
    return [toRoman(Math.abs(when.millennium))];
  }
  if ('century' in when) {
    return [when.century, when.centuryTo ?? when.century].map((value) => toRoman(Math.abs(value)));
  }

  return [when.year, when.yearTo ?? when.year].map((value) => String(Math.abs(value)));
};

// Век пишем только для точных лет. Для «около 3000 г. до н.э.» строчка
// «XXX век» ничего не добавляет, а там, где дата и так дана веком, она лишняя
export const formatCenturyOf = (when) => {
  if (!isDated(when) || !('year' in when) || when.approx) {
    return '';
  }

  const from = centuryOfYear(when.year);
  const to = when.yearTo === undefined ? from : centuryOfYear(when.yearTo);

  return formatCentury(from === to ? { century: from } : { century: from, centuryTo: to });
};

// Границы века в годах. Года «ноль» не было: I век — это 1–100 годы,
// а X век до н.э. — с 1000-го по 901-й
const centuryBounds = (century) =>
  century < 0 ? [century * 100, (century + 1) * 100 - 1] : [(century - 1) * 100 + 1, century * 100];

// «Начало», «середина» и «конец» — треть периода. Точного года в учебнике
// всё равно нет, а так его слово видно на ленте: «середина III тысячелетия»
// не растягивается полосой на всю тысячу лет
const PART_SHARES = { начало: [0, 1 / 3], середина: [1 / 3, 2 / 3], конец: [2 / 3, 1] };

const narrowToPart = ([start, end], part) => {
  if (!Object.hasOwn(PART_SHARES, part ?? '')) {
    return { start, end };
  }

  const [from, to] = PART_SHARES[part];
  const length = end - start;

  return { start: Math.round(start + length * from), end: Math.round(start + length * to) };
};

// Отрезок времени события в годах, для ленты и для сортировки.
// Точная дата — отрезок нулевой длины. Век и тысячелетие — весь период
// (или его треть, см. выше): поставить такое событие точкой в середину
// века значило бы выдумать дату, которой в учебнике нет
export const toSpan = (when) => {
  if ('yearsAgo' in when) {
    return { start: -when.yearsAgo, end: -when.yearsAgo };
  }
  if ('millennium' in when) {
    // Тысячелетия до н.э.: III — с 3000-го по 2001-й год
    return narrowToPart([when.millennium * 1000, (when.millennium + 1) * 1000 - 1], when.part);
  }
  if ('century' in when) {
    const [start] = centuryBounds(when.century);
    const [, end] = centuryBounds(when.centuryTo ?? when.century);

    return narrowToPart([start, end], when.part);
  }

  return { start: when.year, end: when.yearTo ?? when.year };
};
