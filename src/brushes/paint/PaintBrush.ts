import * as PIXI from "pixi.js";

import { PaintShader } from "./PaintShader";
import { BaseBrush } from "../BaseBrush";
import type { PixiPage } from "../../PixiPage";
import { BrushKind } from "../../enums";

export class PaintBrush extends BaseBrush {
  kind = BrushKind.Paint;

  private readonly app: PIXI.Application;
  private brush: PIXI.Mesh<PIXI.Geometry, PaintShader>;

  constructor(
    app: PIXI.Application,
    shapeTexture: PIXI.Texture,
    grainTexture: PIXI.Texture
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

  get shapeTexture() {
    return this.brush.shader.shapeTexture;
  }

  set shapeTexture(value) {
    this.brush.shader.shapeTexture = value;
  }

  get size() {
    return this.brush.shader.brushSize;
  }

  set size(value) {
    this.brush.shader.brushSize = value;
  }

  set color(value: [number, number, number, number]) {
    this.brush.shader.brushColor = value;
  }

  draw(pointA: [number, number], pointB: [number, number], page: PixiPage) {
    const distance = Math.sqrt(
      Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2)
    );

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
      const x = start[0] - page.position.x - renderTexture.width / 2;
      const y = start[1] - page.position.y - renderTexture.width / 2;

      this.brush.position.x = x;
      this.brush.position.y = y;
      this.brush.shader.position = [x, y];
      this.app.renderer.render({
        container: this.brush,
        target: page.texture,
        clear: false,
      });
    }
  }
}
