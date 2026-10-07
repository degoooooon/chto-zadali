// Русское склонение по числу: 1 событие, 2 события, 5 событий.
// forms — три формы в этом порядке.

export const EVENT_FORMS = ['событие', 'события', 'событий'];

export const plural = (count, forms) => {
  const lastTwo = Math.abs(count) % 100;
  const last = lastTwo % 10;

  // 11–14 идут не по последней цифре: «11 событий», а не «11 событие»
  if (lastTwo >= 11 && lastTwo <= 14) {
    return forms[2];
  }
  if (last === 1) {
    return forms[0];
  }
  if (last >= 2 && last <= 4) {
    return forms[1];
  }

  return forms[2];
};
