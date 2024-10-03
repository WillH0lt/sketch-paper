/// <reference types="vite/client" />

import type SketchPaper from 'sketchpaper';

declare global {
  interface Window {
    SketchPaper: SketchPaper;
  }
}
