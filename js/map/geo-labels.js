// Подписи морей, рек и стран. Размер шрифта не меняется
// с приближением, поэтому подписи стоят в отдельном слое поверх карты
// и переставляются при каждом движении камеры.

import { createSvgElement } from '../dom.js';

export const createGeoLabels = ({ view, labels }) => {
  const items = labels.map((label) => {
    const node = createSvgElement('text', `map-label map-label--${label.kind}`);

    node.textContent = label.text;
    view.overlay.append(node);

    return { ...label, node, point: view.project(label.lon, label.lat) };
  });

  view.onChange(() => {
    const zoom = view.getZoom();

    for (const { node, point, minZoom, maxZoom = Infinity } of items) {
      const isVisible = zoom >= minZoom && zoom <= maxZoom;

      node.classList.toggle('map-label--hidden', !isVisible);

      if (isVisible) {
        const [x, y] = view.toScreen(point);

        node.setAttribute('x', x.toFixed(1));
        node.setAttribute('y', y.toFixed(1));
      }
    }
  });
};
