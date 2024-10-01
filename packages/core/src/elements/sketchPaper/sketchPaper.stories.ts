import type { Meta } from '@storybook/web-components';
import { html } from 'lit';
import './sketchPaper.js';

export default {
  title: 'Sketch Paper',
  component: 'sketch-paper',
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
      <sketch-paper
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
      ></sketch-paper>
    </div>`,
} as Meta;

export const sketchPaper = {
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
