import { system } from '@lastolivegames/becsy';
import * as PIXI from 'pixi.js';

import floodfill from '../FloodFill.js';
import * as comps from '../components/index.js';
import { BrushKindEnum } from '../types.js';
import SketchBase from './SketchBase.js';
import { hexToRgba } from './common.js';

@system
class SketchFloodFillHandler extends SketchBase {
  public readonly app!: PIXI.Application;

  private readonly input = this.singleton.read(comps.Input);

  private readonly brush = this.singleton.read(comps.Brush);

  public execute(): void {
    if (this.input.pointerDownTrigger && this.brush.kind === BrushKindEnum.FloodFill) {
      this.renderFloodFill();
    }
  }

  public renderFloodFill(): void {
    const point = this.input.pointerWorld;
    const intersected = this.getIntersectedTiles(point);
    if (!intersected.length) return;

    for (const intersect of intersected) {
      const x = Math.floor(point[0] - intersect.position.x);
      const y = Math.floor(point[1] - intersect.position.y);

      const pixels = this.app.renderer.extract.pixels(intersect.texture);
      const rgba = hexToRgba(this.brush.color);

      const didMakeChange = floodfill(pixels.pixels, pixels.width, pixels.height, x, y, rgba);
      if (!didMakeChange) return;

      const canvas = document.createElement('canvas');
      canvas.width = pixels.width;
      canvas.height = pixels.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = new ImageData(pixels.pixels, pixels.width, pixels.height);
      ctx.putImageData(imageData, 0, 0);
      const texture = PIXI.Texture.from(canvas);

      const container = new PIXI.Sprite(texture);
      this.app.renderer.render({
        container,
        target: intersect.texture,
        clear: false,
      });

      const tileEntity = this.getTileEntity(intersect);
      if (!tileEntity) return;
      this.snapshotTiles([tileEntity]);
    }
  }
}

export default SketchFloodFillHandler;
