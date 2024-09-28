import * as PIXI from 'pixi.js';

import type PixiTile from '../../PixiTile.js';
import { BrushKindEnum } from '../../types.js';
import BaseBrush from '../BaseBrush.js';
import { SmudgeShader } from './SmudgeShader.js';

class SmudgeBrush extends BaseBrush {
  public readonly kind = BrushKindEnum.Smudge;

  public color = [0, 0, 0, 0] as [number, number, number, number];

  private readonly app: PIXI.Application;

  private readonly brush: PIXI.Mesh<PIXI.Geometry, SmudgeShader>;

  public constructor(app: PIXI.Application, shapeTexture: PIXI.Texture) {
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

    const shader = new SmudgeShader({
      texture,
      shapeTexture,
      brushSize: 50,
    });

    this.brush = new PIXI.Mesh({
      geometry: quadGeometry,
      shader,
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

  public draw(pointA: [number, number], pointB: [number, number], tile: PixiTile): void {
    const distance = Math.sqrt((pointB[0] - pointA[0]) ** 2 + (pointB[1] - pointA[1]) ** 2);

    const nPoints = Math.max(Math.floor(distance / (0.05 * this.size)), 2);
    // if (nPoints <= 0) return null;

    const points = [];
    for (let i = 0; i < nPoints; i++) {
      const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
      const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
      points.push([x, y]);
    }

    const transform = new PIXI.Matrix();
    for (let i = 0; i < points.length - 1; i++) {
      const renderTexture = this.brush.shader.texture;
      const start = points[i];
      const end = points[i + 1];
      transform.tx = -start[0] + tile.position.x + renderTexture.width / 2;
      transform.ty = start[1] + tile.position.y + renderTexture.height / 2;
      this.app.renderer.render({
        container: tile.mesh,
        target: renderTexture,
        transform,
        clear: true,
      });

      const x = end[0] - tile.position.x - renderTexture.width / 2;
      const y = end[1] - tile.position.y - renderTexture.width / 2;

      this.brush.position.x = x;
      this.brush.position.y = y;

      this.app.renderer.render({
        container: this.brush,
        target: tile.texture,
        clear: false,
      });
    }
  }
}

export default SmudgeBrush;
