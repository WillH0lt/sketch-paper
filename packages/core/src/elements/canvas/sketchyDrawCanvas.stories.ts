import type { Meta } from '@storybook/web-components';
import { html } from 'lit';
import './sketchyDrawCanvas.js';

export default {
  title: 'Sketchy Draw Canvas',
  component: 'sketchy-draw-canvas',
  render: ({
    minZoom,
    maxZoom,
    tileWidth,
    tileHeight,
    tileCountX,
    tileCountY,
    baseUrl,
    baseColor,
    backgroundColor,
    allowUndo,
  }) =>
    html` <div style="width: 100%; height: calc(100vh - 2rem);">
      <sketchy-draw-canvas
        min-zoom=${minZoom}
        max-zoom=${maxZoom}
        tile-width=${tileWidth}
        tile-height=${tileHeight}
        tile-count-x=${tileCountX}
        tile-count-y=${tileCountY}
        base-url=${baseUrl}
        base-color=${baseColor}
        background-color=${backgroundColor}
        ?allow-undo=${allowUndo}
      ></sketchy-draw-canvas>
    </div>`,
} as Meta;

export const sketchyDrawCanvas = {
  args: {
    minZoom: 0.25,
    maxZoom: 10,
    tileWidth: 2048,
    tileHeight: 2048,
    tileCountX: 1,
    tileCountY: 1,
    baseUrl: '',
    baseColor: '#C2BCB0',
    backgroundColor: '#FFFFFF',
    allowUndo: false,
  },
};
