/// <reference types="vite/client" />

import type SketchyDrawCanvas from 'sketchydraw';

declare global {
  interface Window {
    SketchyDrawCanvas: SketchyDrawCanvas;
  }
}
