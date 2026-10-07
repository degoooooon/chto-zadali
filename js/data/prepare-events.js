// Готовит события к показу: проверяет ссылки и ставит по порядку времени.

import { isDated, toDateTokens, toSpan } from '../time/when.js';

// Событие с опечаткой в месте или разделе пропускаем и пишем в консоль.
// Без проверки одна опечатка в events.js роняет всю страницу: карта
// пытается взять координаты у undefined
const hasAnswer = (answer) =>
  ['basic', 'details', 'depth'].every((key) => typeof answer?.[key] === 'string' && answer[key]);

export const prepareEvents = ({ events, places, eras, answers, paragraphs }) => {
  const eraIds = new Set(eras.map((era) => era.id));
  const paragraphIds = new Set(paragraphs.map((paragraph) => paragraph.id));
  const seenIds = new Set();
  const valid = [];

  for (const event of events) {
    const problem =
      (!Object.hasOwn(places, event.place) && `нет места «${event.place}»`) ||
      (!eraIds.has(event.era) && `нет раздела «${event.era}»`) ||
      (!paragraphIds.has(event.paragraph) && `нет параграфа «${event.paragraph}»`) ||
      (seenIds.has(event.id) && 'такой id уже есть') ||
      (!hasAnswer(answers[event.id]) && 'нет рассказа в answers.js или он неполный');

    if (problem) {
      console.warn(`Событие «${event.id}» пропущено: ${problem}`);
      continue;
    }

    // Дата записана дважды: числом в событии и словами в рассказе на «3».
    // Поправят одно, забудут другое — и карточка покажет два разных года.
    // Событие не выбрасываем, но в консоль пишем
    const missing = isDated(event.when)
      ? toDateTokens(event.when).filter((token) => !answers[event.id].basic.includes(token))
      : [];

    if (missing.length) {
      console.warn(`Рассказ «${event.id}» на «3» не называет дату события: нет «${missing.join('», «')}»`);
    }

    seenIds.add(event.id);
    valid.push({ ...event, answer: answers[event.id] });
  }

  // Порядок — по началу события: «VIII–VI века» встают по 800 году.
  // Сортировка устойчивая: события одного года остаются в том порядке,
  // в каком записаны в файле (Фермопилы раньше Саламина)
  const dated = valid
    .filter((event) => isDated(event.when))
    .sort((a, b) => toSpan(a.when).start - toSpan(b.when).start);

  // События без даты идут в конце списка: места во времени у них нет,
  // и вставить их между датами значило бы эту дату придумать
  return [...dated, ...valid.filter((event) => !isDated(event.when))];
};
