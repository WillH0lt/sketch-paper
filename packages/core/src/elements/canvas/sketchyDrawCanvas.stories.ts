import type { Meta } from '@storybook/web-components';
import { html } from 'lit';
import './sketchyDrawCanvas.js';

export default {
  title: 'Sketchy Draw Canvas',
  component: 'sketchy-draw-canvas',
  render: ({ who }) =>
    html` <div style="width: 100%; height: calc(100vh - 2rem);">
      <sketchy-draw-canvas who=${who}></sketchy-draw-canvas>
    </div>`,
} as Meta;

export const sketchyDrawCanvas = { args: { who: 'paper' } };
