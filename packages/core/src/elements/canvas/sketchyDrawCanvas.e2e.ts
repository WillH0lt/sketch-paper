import { expect, test } from '@sand4rt/experimental-ct-web';
import SketchyDrawCanvas from './sketchyDrawCanvas.js';

test('mounts to dom', async ({ mount }) => {
  const component = await mount(SketchyDrawCanvas);

  await expect(component).toBeAttached();
});
