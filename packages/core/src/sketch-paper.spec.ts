import { describe, expect, it } from '@jest/globals';
import SketchPaper from './elements/sketchPaper/sketchPaper.js';
import SketchPaperComponents from './sketch-paper.js';

describe('sketch paper components', () => {
  it('exports the web component', () => {
    expect(SketchPaperComponents).toStrictEqual(SketchPaper);
  });
});
