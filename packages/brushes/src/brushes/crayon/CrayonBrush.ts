import * as PIXI from 'pixi.js';

import BaseBrush from '../BaseBrush.js';
import type { DrawSegment } from '../types.js';
import { BrushKinds } from '../types.js';
import { CrayonShader } from './CrayonShader.js';

class CrayonBrush extends BaseBrush {
  public static kind = BrushKinds.Crayon;

  public stampSpacing = 0.1;

  private shader: CrayonShader | null = null;

  // defined as a property to avoid memory overhead from creating new transform every frame
  private readonly _transform = new PIXI.Matrix();

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

  public draw(segment: DrawSegment, texture: PIXI.Texture): void {
    if (!this.brush || !this.shader) {
      throw new Error('cannot draw, brush is not initialized');
    }

    this.shader.setBrushColor([segment.red, segment.green, segment.blue, segment.alpha]);
    const spacing = this.stampSpacing * segment.size;

    const direction = [segment.endX - segment.startX, segment.endY - segment.startY];
    const segmentLength = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
    direction[0] /= segmentLength;
    direction[1] /= segmentLength;

    let stampedLength = 0;
    const point = [segment.startX, segment.startY] as [number, number];
    if (segment.runningLength > 0) {
      const diff = segment.runningLength % spacing;
      point[0] += direction[0] * diff;
      point[1] += direction[1] * diff;
      stampedLength += diff;
    }

    while (stampedLength < segmentLength) {
      const x = point[0] + direction[0] * spacing;
      const y = point[1] + direction[1] * spacing;
      stampedLength += spacing;

      this.shader.setPrevPosition(point);
      this.shader.setPosition([x, y]);
      point[0] = x;
      point[1] = y;

      this._transform
        .identity()
        .scale(segment.size, segment.size)
        .translate(x - segment.tileX - segment.size / 2, y - segment.tileY - segment.size / 2);

      this.app.renderer.render({
        transform: this._transform,
        target: texture,
        container: this.brush,
        clear: false,
      });
    }
  }
}

export default CrayonBrush;
