import SketchyDrawCanvas from './sketchCanvas.js';
import './style.css';
// import { image, segments } from './testData.js';

const sketchyDrawCanvas = new SketchyDrawCanvas();
window.SketchyDrawCanvas = sketchyDrawCanvas;

// async function run(): Promise<void> {
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-floating-promises
//   const element = document.querySelector<HTMLButtonElement>('#app')!;
//   await sketchyDrawCanvas.init(element, 2048, 0);

//   await sketchyDrawCanvas.loadImage(image);

//   sketchyDrawCanvas.draw(segments);
// }

// run().catch((err: unknown) => {
//   console.error(err);
// });
