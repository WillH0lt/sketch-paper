import { describe, expect, it } from '@jest/globals';
import SketchyDrawCanvas from './elements/canvas/sketchyDrawCanvas.js';
import SketchyDrawComponents from './sketchy-draw.js';

describe('sketchy draw components', () => {
  it('exports the web component', () => {
    expect(SketchyDrawComponents).toStrictEqual(SketchyDrawCanvas);
  });
});
