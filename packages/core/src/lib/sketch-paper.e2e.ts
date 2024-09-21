import { expect, test } from '@sand4rt/experimental-ct-web';
import SketchPaper from './sketch-paper.js';

test('starts with hello', async ({ mount }) => {
  const component = await mount(SketchPaper);

  await expect(component).toContainText('Hello world!');
});
