import { describe, expect, it } from '@jest/globals';
import HelloWebComponents from './hello-web-components.js';
import SketchPaper from './lib/sketch-paper.js';

describe('hello web components', () => {
  it('exports the web component', () => {
    expect(HelloWebComponents).toStrictEqual(SketchPaper);
  });
});
