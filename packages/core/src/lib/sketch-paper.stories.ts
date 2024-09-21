import type { Meta } from '@storybook/web-components';
import { html } from 'lit';
import './sketch-paper.js';

export default {
  title: 'Sketch Paper',
  component: 'sketch-paper',
  render: ({ who }) => html`<sketch-paper who=${who}></sketch-paper>`,
} as Meta;

export const sketchPaper = { args: { who: 'paper' } };
