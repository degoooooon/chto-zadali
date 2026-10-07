// Маленькая карта в углу: рамка показывает, какой кусок мира сейчас на экране.
// Без неё на большом приближении видны одни Афины и непонятно, где это вообще.

import { createSvgElement } from '../dom.js';

// Пока карта видна почти целиком, рамка совпадает с краями и только мешает
const SHOW_FROM_ZOOM = 1.5;

export const createLocator = ({ container, view, landPath }) => {
  const { width, height } = view.getMapSize();
  const svg = createSvgElement('svg', 'locator__svg', {
    viewBox: `0 0 ${width} ${height.toFixed(0)}`,
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const frame = createSvgElement('rect', 'locator__frame');

  svg.append(createSvgElement('path', 'locator__land', { d: landPath }), frame);
  container.append(svg);

  view.onChange(() => {
    const visible = view.getVisibleRect();

    container.classList.toggle('locator--visible', view.getZoom() >= SHOW_FROM_ZOOM);
    frame.setAttribute('x', visible.x.toFixed(1));
    frame.setAttribute('y', visible.y.toFixed(1));
    frame.setAttribute('width', visible.width.toFixed(1));
    frame.setAttribute('height', visible.height.toFixed(1));
  });
};
