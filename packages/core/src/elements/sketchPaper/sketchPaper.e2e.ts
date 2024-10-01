import { expect, test } from '@sand4rt/experimental-ct-web';
import SketchPaper from './sketchPaper.js';

test('mounts to dom', async ({ mount }) => {
  const component = await mount(SketchPaper);

  await expect(component).toBeAttached();
});
