// Общее состояние страницы: какое событие выбрано и какие разделы скрыты.
// Карта, лента и карточка сами друг о друге не знают, они подписаны сюда.
// Иначе каждый новый блок пришлось бы вручную связывать со всеми прежними.

export const createStore = (initialState) => {
  let state = initialState;
  const listeners = new Set();

  return {
    get: () => state,

    set: (patch) => {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
    },

    subscribe: (listener) => {
      listeners.add(listener);
    },
  };
};
