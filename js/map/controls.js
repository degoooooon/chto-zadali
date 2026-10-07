// Кнопки «ближе», «дальше» и «вся карта». Нужны тем, у кого нет колеса
// и кто управляет с клавиатуры: перетаскивание мышью им недоступно.

const ZOOM_STEP = 1.6;

export const enableControls = (container, view) => {
  const center = () => {
    const { width, height } = view.getSize();

    return [width / 2, height / 2];
  };

  const actions = {
    in: () => view.zoomAt(center(), ZOOM_STEP),
    out: () => view.zoomAt(center(), 1 / ZOOM_STEP),
    reset: () => view.reset(),
  };

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-map-action]');
    // Имя действия берём из разметки, поэтому проверяем, что такое есть:
    // опечатка в data-атрибуте иначе даст «actions[...] is not a function»
    const action = button && Object.hasOwn(actions, button.dataset.mapAction)
      ? actions[button.dataset.mapAction]
      : null;

    if (action) {
      view.stop();
      action();
    }
  });
};
