import type { SketchPaper } from '@sketch-paper/core';
import { BrushKinds } from '@sketch-paper/core';

async function run(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.querySelector('#app')!.innerHTML = `
    <sketch-paper
      brush-color="#ffffff"
      brush-kind="${BrushKinds.Crayon}"
      brush-size="30"
    />
  `;

  const sketchPaper = document.getElementsByTagName('sketch-paper')[0] as SketchPaper;

  await sketchPaper.initialize({
    startX: 1024,
    startY: 1024,
    tileWidth: 2048,
    tileHeight: 2048,
    baseColor: '#000000',
    backgroundColor: '#32a852',
    brushes: [BrushKinds.Crayon],
  });
}

run().catch((err: unknown) => {
  console.error(err);
});
