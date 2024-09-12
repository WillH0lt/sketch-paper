import * as PIXI from "pixi.js";

import { BaseBrush } from "../BaseBrush";
import { MarkerShader } from "./MarkerShader";
import type { PixiPage } from "../../PixiPage";
import { BrushKind } from "../../enums";

export class MarkerBrush extends BaseBrush {
  kind = BrushKind.Marker;

  private readonly app: PIXI.Application;
  private brush: PIXI.Mesh<PIXI.Geometry, MarkerShader>;
  private lastPosition: [number, number] | null = null;

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

    const shader = new MarkerShader({
      texture,
      shapeTexture,
      grainTexture,
    });

    this.brush = new PIXI.Mesh({
      geometry: quadGeometry,
      shader,
      blendMode: "multiply",
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

  reset() {
    this.lastPosition = null;
  }

  draw(pointA: [number, number], pointB: [number, number], page: PixiPage) {
    const distance = Math.sqrt(
      Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2)
    );

    const nPoints = Math.floor(distance / (0.05 * this.size));
    if (nPoints <= 0) return null;

    const points = [];
    for (let i = 0; i < nPoints; i++) {
      const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
      const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
      points.push([x, y]);
    }

    for (let i = 0; i < points.length; i++) {
      const renderTexture = this.brush.shader.texture;
      const point = points[i];
      const x = point[0] - page.position.x - renderTexture.width / 2;
      const y = point[1] - page.position.y - renderTexture.width / 2;

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
        target: page.texture,
        clear: false,
      });
    }
  }
}
