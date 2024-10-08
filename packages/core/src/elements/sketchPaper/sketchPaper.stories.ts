import type { Meta } from '@storybook/web-components';
import { html } from 'lit';

import { BrushKinds, PointerActions, WheelActions } from '../../types.js';
import './sketchPaper.js';
import type SketchPaper from './sketchPaper.js';

export default {
  title: 'Sketch Paper',
  component: 'sketch-paper',
  render: ({ brushColor, brushSize }) =>
    html` <div style="width: 100%; height: calc(100vh - 2rem);">
      <sketch-paper
        brush-color=${brushColor}
        brush-size=${brushSize}
        brush-kind=${BrushKinds.Crayon}
        action-left-mouse=${PointerActions.Draw}
        action-middle-mouse=${PointerActions.Pan}
        action-right-mouse=${PointerActions.Pan}
        action-wheel=${WheelActions.Zoom}
      ></sketch-paper>
    </div>`,
  play: () => {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const sketchPaper = document.querySelector('sketch-paper') as SketchPaper;

    sketchPaper
      .initialize({
        baseUrl: 'https://storage.googleapis.com/crayontown',
        loadingImg: '/loading.png',
        brushes: [BrushKinds.Crayon],
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  },
} as Meta;

export const sketchPaper = {
  args: {
    brushColor: '#000000',
    brushSize: 10,
  },
};
