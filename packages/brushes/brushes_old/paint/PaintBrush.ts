import { getStrokePoints } from 'perfect-freehand';
import * as PIXI from 'pixi.js';

import type PixiTile from '../../PixiTile.js';
import { BrushKindEnum } from '../../types.js';
import BaseBrush from '../BaseBrush.js';
import { PaintShader } from './PaintShader.js';

class PaintBrush extends BaseBrush {
  public readonly kind = BrushKindEnum.Paint;

  private readonly app: PIXI.Application;

  private readonly brush: PIXI.Mesh<PIXI.Geometry, PaintShader>;

  private points: [number, number][] = [];

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

    const shader = new PaintShader({
      texture,
      shapeTexture,
      grainTexture,
      position: [0, 0],
      brushSize: 50,
      brushColor: [0, 0, 0, 0],
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

  public set color(value: [number, number, number, number]) {
    this.brush.shader.brushColor = value;
  }

  public reset(): void {
    this.points = [];
  }

  public draw(pointA: [number, number], pointB: [number, number], tile: PixiTile): void {
    if (this.points.length === 0) this.points.push([pointA[0], pointA[1]]);
    this.points.push([pointB[0], pointB[1]]);

    const stroke = getStrokePoints(this.points.slice(-50), {
      // size: this.size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true,
    });

    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1].point as [number, number];
      const b = stroke[i].point as [number, number];
      this.size = 50 * stroke[i].pressure;
      // console.log(stroke[i]);
      // const size = this.size * stroke[i].pressure;
      this._drawSegment(a, b, tile);
    }
  }

  private _drawSegment(pointA: [number, number], pointB: [number, number], tile: PixiTile): void {
    const distance = Math.sqrt((pointB[0] - pointA[0]) ** 2 + (pointB[1] - pointA[1]) ** 2);

    const nPoints = Math.max(Math.floor(distance / (0.05 * this.size)), 2);

    const points = [];
    for (let i = 0; i < nPoints; i++) {
      const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
      const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
      points.push([x, y]);
    }

    for (let i = 0; i < points.length; i++) {
      const renderTexture = this.brush.shader.texture;
      const start = points[i];
      const x = start[0] - tile.position.x - renderTexture.width / 2;
      const y = start[1] - tile.position.y - renderTexture.width / 2;

      this.brush.position.x = x;
      this.brush.position.y = y;
      this.brush.shader.position = [x, y];
      this.app.renderer.render({
        container: this.brush,
        target: tile.texture,
        clear: false,
      });
    }
  }
}

export default PaintBrush;
