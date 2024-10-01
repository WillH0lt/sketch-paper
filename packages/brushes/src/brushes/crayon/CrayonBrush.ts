import * as PIXI from 'pixi.js';

import BaseBrush from '../BaseBrush.js';
import { CrayonShader } from './CrayonShader.js';

class CrayonBrush extends BaseBrush {
  private lastPosition: [number, number] | null = null;

  private shader: CrayonShader | null = null;

  private readonly transform = new PIXI.Matrix();

  public async init(): Promise<void> {
    PIXI.Assets.add([
      {
        alias: 'crayonShape',
        src: 'https://storage.googleapis.com/chalkland-public/brushes/crayon/shape.png',
      },
      {
        alias: 'crayonGrain',
        src: 'https://storage.googleapis.com/chalkland-public/brushes/crayon/grain.png',
      },
    ]);

    const { crayonShape, crayonGrain } = (await PIXI.Assets.load([
      'crayonShape',
      'crayonGrain',
    ])) as { crayonShape: PIXI.Texture; crayonGrain: PIXI.Texture };

    this.shader = new CrayonShader({
      crayonShape,
      crayonGrain,
      brushSize: 30,
      brushColor: [1, 0, 0, 1],
    });

    this.initializeBrush(this.shader, {
      blendMode: 'multiply',
    });
  }

  public onStrokeEnd(): void {
    this.lastPosition = null;
  }

  public draw(
    pointA: [number, number],
    pointB: [number, number],
    surface: PIXI.Sprite | PIXI.Mesh,
  ): void {
    if (!this.brush || !this.shader) return;

    const size = this.shader.getBrushSize();

    const distance = Math.sqrt((pointB[0] - pointA[0]) ** 2 + (pointB[1] - pointA[1]) ** 2);

    let d = 0.1;
    if (size > 25) {
      d = 0.05;
    }
    const nPoints = Math.floor(distance / (d * size));

    const points = [];
    for (let i = 0; i < nPoints; i++) {
      const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
      const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
      points.push([x, y]);
    }

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const x = point[0];
      const y = point[1];

      if (!this.lastPosition) {
        this.lastPosition = [x, y];
        continue;
      }
      this.shader.setLastPosition(this.lastPosition);
      this.shader.setPosition([x, y]);
      this.lastPosition = [x, y];

      this.transform
        .identity()
        .scale(size, size)
        .translate(x - surface.position.x - size / 2, y - surface.position.y - size / 2);

      this.app.renderer.render({
        transform: this.transform,
        target: surface.texture,
        container: this.brush,
        clear: false,
      });
    }
  }
}

export default CrayonBrush;

declare global {
  interface GlobalBrushMap {
    crayon: CrayonBrush;
  }
}
