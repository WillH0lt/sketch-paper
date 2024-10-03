import * as PIXI from 'pixi.js';

import BaseBrush from '../BaseBrush.js';
import type { DrawSegment } from '../types.js';
import { BrushKindEnum } from '../types.js';
import { CrayonShader } from './CrayonShader.js';

class CrayonBrush extends BaseBrush {
  public static kind = BrushKindEnum.Crayon;

  private lastPosition: [number, number] | null = null;

  private shader: CrayonShader | null = null;

  private readonly transform = new PIXI.Matrix();

  public async init(): Promise<void> {
    PIXI.Assets.add([
      {
        alias: 'crayonShape',
        src: 'https://storage.googleapis.com/sketch-paper-public/brushes/crayon/shape.png',
      },
      {
        alias: 'crayonGrain',
        src: 'https://storage.googleapis.com/sketch-paper-public/brushes/crayon/grain.png',
      },
    ]);

    const { crayonShape, crayonGrain } = (await PIXI.Assets.load([
      'crayonShape',
      'crayonGrain',
    ])) as { crayonShape: PIXI.Texture; crayonGrain: PIXI.Texture };

    this.shader = new CrayonShader({
      crayonShape,
      crayonGrain,
    });

    this.initializeBrush(this.shader, {
      blendMode: 'multiply',
    });
  }

  public onStrokeEnd(): void {
    this.lastPosition = null;
  }

  public draw(segment: DrawSegment, texture: PIXI.Texture): void {
    if (!this.brush || !this.shader) return;

    this.shader.setBrushColor([segment.red, segment.green, segment.blue, segment.alpha]);

    const distance = Math.sqrt(
      (segment.endX - segment.startX) ** 2 + (segment.endY - segment.startY) ** 2,
    );

    let d = 0.1;
    if (segment.size > 25) {
      d = 0.05;
    }
    const nPoints = Math.floor(distance / (d * segment.size));

    const points = [];
    for (let i = 0; i < nPoints; i++) {
      const x = segment.startX + (segment.endX - segment.startX) * (i / nPoints);
      const y = segment.startY + (segment.endY - segment.startY) * (i / nPoints);
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
        .scale(segment.size, segment.size)
        .translate(x - segment.tileX - segment.size / 2, y - segment.tileY - segment.size / 2);

      this.app.renderer.render({
        transform: this.transform,
        target: texture,
        container: this.brush,
        clear: false,
      });
    }
  }
}

export default CrayonBrush;
