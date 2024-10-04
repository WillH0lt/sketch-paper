import * as PIXI from 'pixi.js';

import BaseBrush from '../BaseBrush.js';
import type { DrawSegment } from '../types.js';
import { BrushKindEnum } from '../types.js';
import { CrayonShader } from './CrayonShader.js';

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

class CrayonBrush extends BaseBrush {
  public static kind = BrushKindEnum.Crayon;

  private readonly lastPositionMap = new Map<string, [number, number]>(); // : [number, number] | null = null;

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

  // public onStrokeEnd(): void {
  // this.lastPosition = null;
  // }

  public draw(segment: DrawSegment, texture: PIXI.Texture): void {
    if (!this.brush || !this.shader) return;

    const key = `${segment.tileX}_${segment.tileY}`;

    let lastPosition = this.lastPositionMap.get(key);
    if (!lastPosition) {
      lastPosition = [segment.startX, segment.startY];
      this.lastPositionMap.set(key, lastPosition);
    }

    // this.lastPosition = [segment.startX, segment.startY];
    // if (!this.lastPosition) {
    // }
    if (distance(segment.startX, segment.startY, lastPosition[0], lastPosition[1]) > segment.size) {
      // lastPosition = [segment.startX, segment.startY];
      lastPosition[0] = segment.startX;
      lastPosition[1] = segment.startY;
    }

    this.shader.setBrushColor([segment.red, segment.green, segment.blue, segment.alpha]);

    let dist = distance(segment.startX, segment.startY, segment.endX, segment.endY);

    const d = 0.1;
    // if (segment.size > 25) {
    //   d = 0.05;
    // }

    const spacing = d * segment.size;
    if (dist < spacing) {
      // use the last position to calculate the distance if the distance is too small
      dist = distance(segment.startX, segment.startY, lastPosition[0], lastPosition[1]);
    }

    const nPoints = Math.floor(dist / spacing);

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

      this.shader.setLastPosition(lastPosition);
      this.shader.setPosition([x, y]);
      lastPosition[0] = x;
      lastPosition[1] = y;

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
