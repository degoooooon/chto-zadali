// Управление картой руками: перетаскивание, колесо, щипок двумя пальцами.

// Мышь всегда чуть дрожит при нажатии. Без порога клик по точке события
// считается началом перетаскивания, и событие не выбирается
const DRAG_THRESHOLD = 4;
const WHEEL_SPEED = 0.0018;

const distance = ([a, b]) => Math.hypot(a.x - b.x, a.y - b.y);
const middle = ([a, b]) => [(a.x + b.x) / 2, (a.y + b.y) / 2];

export const enableGestures = (viewport, view) => {
  const pointers = new Map();
  let isDragging = false;
  let pinchDistance = 0;

  const toLocal = (event) => {
    const box = viewport.getBoundingClientRect();

    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  viewport.addEventListener('pointerdown', (event) => {
    // Кнопки поверх карты (точки событий, плюс и минус) работают сами
    if (event.target.closest('button')) {
      return;
    }

    pointers.set(event.pointerId, toLocal(event));
    view.stop();

    if (pointers.size === 2) {
      pinchDistance = distance([...pointers.values()]);
    }
  });

  viewport.addEventListener('pointermove', (event) => {
    const previous = pointers.get(event.pointerId);

    if (!previous) {
      return;
    }

    const current = toLocal(event);

    if (pointers.size === 1) {
      const deltaX = current.x - previous.x;
      const deltaY = current.y - previous.y;

      if (!isDragging && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
        return;
      }

      if (!isDragging) {
        isDragging = true;
        // Захват: карта продолжает ехать, даже если палец вышел за её край
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('map__viewport--dragging');
      }

      pointers.set(event.pointerId, current);
      view.panBy(deltaX, deltaY);
      return;
    }

    pointers.set(event.pointerId, current);

    if (pointers.size === 2) {
      const pair = [...pointers.values()];
      const nextDistance = distance(pair);

      if (pinchDistance > 0) {
        view.zoomAt(middle(pair), nextDistance / pinchDistance);
      }
      pinchDistance = nextDistance;
    }
  });

  const release = (event) => {
    pointers.delete(event.pointerId);
    pinchDistance = 0;

    if (pointers.size === 0) {
      isDragging = false;
      viewport.classList.remove('map__viewport--dragging');
    }
  };

  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);

  viewport.addEventListener(
    'wheel',
    (event) => {
      // Иначе вместе с картой прокручивается вся страница
      event.preventDefault();
      view.stop();

      const { x, y } = toLocal(event);
      // deltaMode 1 — прокрутка строками (Firefox с мышью), шаг там в десятки раз меньше
      const delta = event.deltaMode === 1 ? event.deltaY * 30 : event.deltaY;

      view.zoomAt([x, y], Math.exp(-delta * WHEEL_SPEED));
    },
    // preventDefault работает только в не-пассивном обработчике
    { passive: false },
  );
};
