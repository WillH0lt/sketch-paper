import type { Entity } from '@lastolivegames/becsy';
import { system } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

import type PixiTile from '../PixiTile.js';
import * as comps from '../components/index.js';
import { BrushKindEnum as BrushKind } from '../types.js';
import SketchBase from './SketchBase.js';
import SketchFloodFillHandler from './SketchFloodFillHandler.js';
import SketchStrokeHandler from './SketchStrokeHandler.js';

import { deleteEntity } from './common.js';

function snapToLine(
  startPoint: [number, number],
  currentPoint: [number, number],
  snapToAxis: boolean,
  snapToDiagonal: boolean,
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
    angle = Math.round((angle - Math.PI / 4) / (Math.PI / 2)) * (Math.PI / 2) + Math.PI / 4;
  }

  if (angle >= 0 && angle < Math.PI / 6) {
    endPoint[0] = currentPoint[0];
    endPoint[1] = startPoint[1];
  } else if (angle >= Math.PI / 6 && angle < Math.PI / 3) {
    endPoint[0] = startPoint[0] + Math.sign(currentPoint[0] - startPoint[0]) * Math.max(dx, dy);
    endPoint[1] = startPoint[1] + Math.sign(currentPoint[1] - startPoint[1]) * Math.max(dx, dy);
  } else {
    endPoint[0] = startPoint[0];
    endPoint[1] = currentPoint[1];
  }

  return endPoint;
}

@system((s) => s.inAnyOrderWith(SketchStrokeHandler, SketchFloodFillHandler))
class SketchShapeHandler extends SketchBase {
  public readonly container!: HTMLElement;

  public readonly app!: PIXI.Application;

  public readonly viewport!: Viewport;

  private readonly input = this.singleton.read(comps.Input);

  private readonly settings = this.singleton.read(comps.Settings);

  private readonly brush = this.singleton.read(comps.Brush);

  private readonly shapes = this.query((q) => q.current.with(comps.Shape).write);

  private readonly tiles = this.query(
    (q) => q.added.and.current.and.removed.and.addedOrChanged.with(comps.Tile).write.trackWrites,
  );

  private readonly shapeGraphics = new PIXI.Graphics();

  public execute(): void {
    if (this.input.pointerDownTrigger) {
      if (
        [BrushKind.Line, BrushKind.Rectangle, BrushKind.Ellipse, BrushKind.Star].includes(
          this.brush.kind,
        )
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

    // delete shapes on pointer up
    if (this.input.pointerUpTrigger) {
      for (const shapeEntity of this.shapes.current) {
        this.viewport.removeChild(this.shapeGraphics);
        this.renderShape();
        deleteEntity(shapeEntity);
      }
    }

    // cancel shape on escape or right click
    if (this.input.escapeDownTrigger || this.input.rightMouseDownTrigger) {
      for (const shapeEntity of this.shapes.current) {
        this.viewport.removeChild(this.shapeGraphics);
        deleteEntity(shapeEntity);
      }
    }
  }

  public drawShape(shapeEntity: Entity): void {
    const shape = shapeEntity.read(comps.Shape);

    let endPoint = [this.input.pointerWorld[0], this.input.pointerWorld[1]] as [number, number];

    if (this.input.shiftDown) {
      if (shape.kind === BrushKind.Line) {
        endPoint = snapToLine(shape.startPoint, endPoint, true, true);
      } else {
        endPoint = snapToLine(shape.startPoint, endPoint, false, true);
      }
    }

    const w = Math.abs(endPoint[0] - shape.startPoint[0]);
    const h = Math.abs(endPoint[1] - shape.startPoint[1]);
    const startX = Math.min(shape.startPoint[0], endPoint[0]);
    const startY = Math.min(shape.startPoint[1], endPoint[1]);

    if (shape.kind === BrushKind.Line) {
      this.shapeGraphics
        .clear()
        .moveTo(shape.startPoint[0], shape.startPoint[1])
        .lineTo(endPoint[0], endPoint[1])
        .stroke({ width: this.brush.size, color: this.brush.color });
    } else if (shape.kind === BrushKind.Rectangle) {
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

    // if (this.shapeGraphics.parent === null) {
    this.viewport.addChild(this.shapeGraphics);
    // }
  }

  private renderShape(): void {
    const aabb = this.shapeGraphics.getBounds().rectangle;
    const tiles = this.intersectAabb(aabb);

    for (const tile of tiles) {
      const localShapeGraphics = this.shapeGraphics.clone();
      localShapeGraphics.position.x -= tile.position.x;
      localShapeGraphics.position.y -= tile.position.y;
      this.app.renderer.render({
        container: localShapeGraphics,
        target: tile.texture,
        clear: false,
      });
    }

    const tileEntities = tiles
      .map((tile) => this.getTileEntity(tile))
      .filter((tileEntity) => tileEntity !== null) as Entity[];
    this.snapshotTiles(tileEntities);
  }

  private intersectAabb(aabb: PIXI.Rectangle): PixiTile[] {
    const intersected: PixiTile[] = [];
    for (const tileEntity of this.tiles.current) {
      const tile = tileEntity.read(comps.Tile);

      const tileAabb = new PIXI.Rectangle(
        tile.position[0],
        tile.position[1],
        this.settings.tileWidth,
        this.settings.tileHeight,
      );

      if (aabb.intersects(tileAabb)) {
        const pixiTile = this.getPixiTile(tileEntity);
        if (pixiTile) intersected.push(pixiTile);
      }
    }

    return intersected;
  }
}

export default SketchShapeHandler;
