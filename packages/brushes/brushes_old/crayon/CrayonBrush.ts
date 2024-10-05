import * as PIXI from 'pixi.js';

import type PixiTile from '../../PixiTile.js';
import { BrushKinds } from '../../types.js';
import BaseBrush from '../BaseBrush.js';
import { CrayonShader } from './CrayonShader.js';

class CrayonBrush extends BaseBrush {
  public readonly kind = BrushKinds.Crayon;

  private readonly app: PIXI.Application;

  private readonly brush: PIXI.Mesh<PIXI.Geometry, CrayonShader>;

  private lastPosition: [number, number] | null = null;

  public constructor(
    app: PIXI.Application,
    shapeTexture: PIXI.Texture,
    grainTexture: PIXI.Texture,
  ) {
    super();
    this.app = app;

    const size = 500;
    const quadGeometry = new PIXI.Geometry({
      attributes: {
        aPosition: [0, 0, 1, 0, 1, 1, 0, 1],
        aUV: [0, 0, 1, 0, 1, 1, 0, 1],
      },
      indexBuffer: [0, 1, 2, 0, 2, 3],
    });

    const texture = PIXI.RenderTexture.create({
      width: size,
      height: size,
    });

    const shader = new CrayonShader({
      texture,
      shapeTexture,
      grainTexture,
    });

    this.brush = new PIXI.Mesh({
      geometry: quadGeometry,
      shader,
      blendMode: 'multiply',
    });
    this.brush.scale.set(size, size);
  }

  public get shapeTexture(): PIXI.TextureSource {
    return this.brush.shader.shapeTexture;
  }

  public set shapeTexture(value: PIXI.TextureSource) {
    this.brush.shader.shapeTexture = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get size(): number {
    return this.brush.shader.brushSize;
  }

  public set size(value: number) {
    this.brush.shader.brushSize = value;
  }

  public set color(value: [number, number, number, number]) {
    this.brush.shader.brushColor = value;
  }

  public reset(): void {
    this.lastPosition = null;
  }

  public draw(pointA: [number, number], pointB: [number, number], tile: PixiTile): void {
    const distance = Math.sqrt((pointB[0] - pointA[0]) ** 2 + (pointB[1] - pointA[1]) ** 2);

    let d = 0.1;
    if (this.size > 25) {
      d = 0.05;
    }
    const nPoints = Math.floor(distance / (d * this.size));

    const points = [];
    for (let i = 0; i < nPoints; i++) {
      const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
      const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
      points.push([x, y]);
    }

    for (let i = 0; i < points.length; i++) {
      const renderTexture = this.brush.shader.texture;
      const point = points[i];
      const x = point[0] - tile.position.x - renderTexture.width / 2;
      const y = point[1] - tile.position.y - renderTexture.width / 2;

      if (!this.lastPosition) {
        this.lastPosition = [x, y];
        continue;
      }
      this.brush.shader.lastPosition = this.lastPosition;
      this.brush.shader.position = [x, y];
      this.brush.position.x = x;
      this.brush.position.y = y;
      this.lastPosition = [x, y];

      this.app.renderer.render({
        container: this.brush,
        target: tile.texture,
        clear: false,
      });
    }
  }
}

export default CrayonBrush;
