import SketchPaper from './sketchCanvas.js';
import './style.css';
// import { image, segments } from './testData.js';

const sketchPaper = new SketchPaper();
window.SketchPaper = sketchPaper;

// async function run(): Promise<void> {
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-floating-promises
//   const element = document.querySelector<HTMLButtonElement>('#app')!;
//   await sketchPaper.init(element, 2048, 0);

//   await sketchPaper.loadImage(image);

//   sketchPaper.draw(segments);
// }

// run().catch((err: unknown) => {
//   console.error(err);
// });
