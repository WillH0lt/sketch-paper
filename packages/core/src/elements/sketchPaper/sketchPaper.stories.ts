import type { Meta } from '@storybook/web-components';
import { html } from 'lit';
import './sketchPaper.js';
import type SketchPaper from './sketchPaper.js';

export default {
  title: 'Sketch Paper',
  component: 'sketch-paper',
  render: ({ brushColor, brushSize }) =>
    html` <div style="width: 100%; height: calc(100vh - 2rem);">
      <sketch-paper brushColor=${brushColor} brushSize=${brushSize}></sketch-paper>
    </div>`,
  play: () => {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const sketchPaper = document.querySelector('sketch-paper') as SketchPaper;

    sketchPaper
      .initialize({})
      .then(async () => sketchPaper.loadBrush(1))
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
