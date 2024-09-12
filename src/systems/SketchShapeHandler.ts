import { system, co, Entity } from "@lastolivegames/becsy";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

import * as comps from "../components";
import * as sys from "../systems";
import { SketchBase } from "./SketchBase";
import { BrushKind } from "../enums";
import { PixiPage } from "../PixiPage";

@system((s) =>
  s.inAnyOrderWith(sys.SketchStrokeHandler, sys.SketchFloodFillHandler)
)
export class SketchShapeHandler extends SketchBase {
  private readonly input = this.singleton.read(comps.Input);
  private readonly settings = this.singleton.read(comps.Settings);
  private readonly brush = this.singleton.read(comps.Brush);

  private readonly shapes = this.query(
    (q) => q.current.with(comps.Shape).write
  );

  private readonly pages = this.query(
    (q) =>
      q.added.and.current.and.removed.and.addedOrChanged.with(comps.Page).write
        .trackWrites
  );

  private shapeGraphics = new PIXI.Graphics();

  // injected via world defs
  protected readonly container!: HTMLElement;
  protected readonly app!: PIXI.Application;
  protected readonly viewport!: Viewport;

  execute(): void {
    if (this.input.pointerDownTrigger) {
      if (
        [
          BrushKind.Line,
          BrushKind.Rectangle,
          BrushKind.Ellipse,
          BrushKind.Star,
        ].includes(this.brush.kind)
      ) {
        const shapeEntity = this.createEntity(comps.Shape, {
          startPoint: this.input.pointerWorld,
          kind: this.brush.kind,
        });

        this.drawShape(shapeEntity);
      }
    }

    // render shapes
    for (const shapeEntity of this.shapes.current) {
      this.drawShape(shapeEntity);
    }

    // delete strokes and shapes on pointer up
    if (this.input.pointerUpTrigger) {
      for (const shapeEntity of this.shapes.current) {
        this.viewport.removeChild(this.shapeGraphics);
        this.renderShape();
        this.deleteEntity(shapeEntity);
      }
    }

    // cancel shape on escape or right click
    if (this.input.escapeDownTrigger || this.input.rightMouseDownTrigger) {
      for (const shapeEntity of this.shapes.current) {
        this.viewport.removeChild(this.shapeGraphics);
        this.deleteEntity(shapeEntity);
      }
    }
  }

  drawShape(shapeEntity: Entity) {
    const shape = shapeEntity.read(comps.Shape);

    let endPoint = [this.input.pointerWorld[0], this.input.pointerWorld[1]] as [
      number,
      number
    ];

    if (this.input.shiftDown) {
      if (shape.kind === BrushKind.Line) {
        endPoint = snapToLine(shape.startPoint, endPoint, true, true);
      } else {
        endPoint = snapToLine(shape.startPoint, endPoint, false, true);
      }
    }

    let w = Math.abs(endPoint[0] - shape.startPoint[0]);
    let h = Math.abs(endPoint[1] - shape.startPoint[1]);
    const startX = Math.min(shape.startPoint[0], endPoint[0]);
    const startY = Math.min(shape.startPoint[1], endPoint[1]);

    if (shape.kind === BrushKind.Line) {
      this.shapeGraphics
        .clear()
        .moveTo(shape.startPoint[0], shape.startPoint[1])
        .lineTo(endPoint[0], endPoint[1])
        .stroke({ width: this.brush.size, color: this.brush.color });
    } else if (shape.kind === BrushKind.Rectangle) {
      console.log("Drawing rectangle", this.brush.size, this.brush.color);
      this.shapeGraphics
        .clear()
        .rect(startX, startY, w, h)
        .stroke({ width: this.brush.size, color: this.brush.color });
    } else if (shape.kind === BrushKind.Ellipse) {
      this.shapeGraphics
        .clear()
        .ellipse(startX + w / 2, startY + h / 2, w / 2, h / 2)
        .stroke({ width: this.brush.size, color: this.brush.color });
    } else if (shape.kind === BrushKind.Star) {
      this.shapeGraphics.clear().star(startX, startY, 5, w, h).stroke({
        width: this.brush.size,
        color: this.brush.color,
      });
    } else {
      this.shapeGraphics.clear();
    }

    if (this.shapeGraphics.parent === null) {
      console.log(this.shapeGraphics);
      this.viewport.addChild(this.shapeGraphics);
    }
  }

  renderShape() {
    const aabb = this.shapeGraphics.getBounds().rectangle;
    const pages = this.intersectAabb(aabb);

    for (const page of pages) {
      const localShapeGraphics = this.shapeGraphics.clone();
      localShapeGraphics.position.x -= page.position.x;
      localShapeGraphics.position.y -= page.position.y;
      this.app.renderer.render({
        container: localShapeGraphics,
        target: page.texture,
        clear: false,
      });
    }

    const pageEntities = pages
      .map((page) => this.getPageEntity(page))
      .filter((pageEntity) => pageEntity !== null) as Entity[];
    this.snapshotPages(pageEntities);
  }

  intersectAabb(aabb: PIXI.Rectangle): PixiPage[] {
    const intersected: PixiPage[] = [];
    for (const pageEntity of this.pages.current) {
      const page = pageEntity.read(comps.Page);

      const pageAabb = new PIXI.Rectangle(
        page.position[0],
        page.position[1],
        this.settings.tileWidth,
        this.settings.tileHeight
      );

      if (aabb.intersects(pageAabb)) {
        const page = this.getPixiPage(pageEntity);
        if (page) intersected.push(page);
      }
    }

    return intersected;
  }
}

function snapToLine(
  startPoint: [number, number],
  currentPoint: [number, number],
  snapToAxis: boolean,
  snapToDiagonal: boolean
): [number, number] {
  if (!snapToAxis && !snapToDiagonal) {
    return currentPoint;
  }

  const endPoint: [number, number] = [0, 0];
  const dx = Math.abs(currentPoint[0] - startPoint[0]);
  const dy = Math.abs(currentPoint[1] - startPoint[1]);
  let angle = Math.atan2(dy, dx);

  if (snapToAxis && !snapToDiagonal) {
    angle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
  } else if (!snapToAxis && snapToDiagonal) {
    angle =
      Math.round((angle - Math.PI / 4) / (Math.PI / 2)) * (Math.PI / 2) +
      Math.PI / 4;
  }

  if (angle >= 0 && angle < Math.PI / 6) {
    endPoint[0] = currentPoint[0];
    endPoint[1] = startPoint[1];
  } else if (angle >= Math.PI / 6 && angle < Math.PI / 3) {
    endPoint[0] =
      startPoint[0] +
      Math.sign(currentPoint[0] - startPoint[0]) * Math.max(dx, dy);
    endPoint[1] =
      startPoint[1] +
      Math.sign(currentPoint[1] - startPoint[1]) * Math.max(dx, dy);
  } else {
    endPoint[0] = startPoint[0];
    endPoint[1] = currentPoint[1];
  }

  return endPoint;
}
