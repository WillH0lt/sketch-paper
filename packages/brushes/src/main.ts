import setupSketchCanvas from './sketchCanvas.ts';
import './style.css';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
await setupSketchCanvas(document.querySelector<HTMLCanvasElement>('#app')!);
