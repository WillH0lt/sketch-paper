import { Emitter } from "strict-event-emitter";
import { system, co } from "@lastolivegames/becsy";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

import * as comps from "../components";
import * as sys from "../systems";
import { hexToRgba } from "../colorUtils";
import { BrushKind } from "../enums";
import { PixiTile } from "../PixiTile";
import { SketchBase } from "./SketchBase";
import type { Events } from "../Emitter";

import { CrayonBrush } from "../brushes/crayon";
import { MarkerBrush } from "../brushes/marker";
import { SmudgeBrush } from "../brushes/smudge";
import { PaintBrush } from "../brushes/paint";
import { BaseBrush } from "../brushes/BaseBrush";

@system((s) => s.inAnyOrderWith(sys.SketchFloodFillHandler))
export class SketchStrokeHandler extends SketchBase {
  private readonly input = this.singleton.read(comps.Input);
  private readonly brush = this.singleton.read(comps.Brush);

  private readonly brushes = this.query(
    (q) => q.addedOrChanged.with(comps.Brush).trackWrites
  );

  private readonly strokes = this.query(
    (q) => q.current.with(comps.Stroke).write
  );

  private brushInstance: BaseBrush | null = null;

  // injected via world defs
  protected readonly app!: PIXI.Application;
  protected readonly viewport!: Viewport;
  private readonly emitter!: Emitter<Events>;

  initialize(): void {
    PIXI.Assets.add([
      { alias: "crayonShape", src: "/img/brushes/crayon/shape.png" },
      { alias: "smudge", src: "/img/brushes/smudge/shape.png" },
      { alias: "paintShape", src: "/img/brushes/paint/shape.png" },
      { alias: "paintGrain", src: "/img/brushes/paint/grain.png" },
      { alias: "markerShape", src: "/img/brushes/marker/shape.png" },
    ]);
  }

  execute(): void {
    for (const brushEntity of this.brushes.addedOrChanged) {
      const brush = brushEntity.read(comps.Brush);
      this.updateBrushInstance(brush);
    }

    if (this.input.pointerDownTrigger) {
      if (this.brushInstance) {
        this.createEntity(comps.Stroke, {
          prevPoint: this.input.pointerWorld,
        });

        this.renderStroke(this.input.pointerWorld, this.input.pointerWorld);
      }
    }

    // render strokes
    for (const strokeEntity of this.strokes.current) {
      const stroke = strokeEntity.write(comps.Stroke);
      const sprites = this.renderStroke(
        stroke.prevPoint,
        this.input.pointerWorld
      );
      stroke.prevPoint = this.input.pointerWorld;

      for (const sprite of sprites) {
        const tileEntity = this.getTileEntity(sprite);
        if (tileEntity) {
          const tile = tileEntity.write(comps.Tile);
          tile.strokeEntity = strokeEntity;
        }
      }
    }

    // delete strokes on pointer up
    if (this.input.pointerUpTrigger) {
      for (const strokeEntity of this.strokes.current) {
        const stroke = strokeEntity.read(comps.Stroke);
        this.snapshotTiles(stroke.tiles);
        this.deleteEntity(strokeEntity);
      }

      this.brushInstance?.reset();
    }
  }

  renderStroke(
    prevPoint: [number, number],
    currentPoint: [number, number]
  ): PixiTile[] {
    if (!this.brushInstance) return [];

    const intersectedA = this.getIntersectedTiles(prevPoint);
    let intersectedB = this.getIntersectedTiles(currentPoint);

    // get union of A and B
    const intersected = intersectedA
      .concat(intersectedB)
      .filter((tile, index, self) => {
        return index === self.findIndex((t) => t === tile);
      });

    for (const tile of intersected) {
      this.brushInstance.draw(prevPoint, currentPoint, tile);
    }

    if (intersected.length > 0) {
      this.emitter.emit("draw", prevPoint, currentPoint);
    }

    return intersected;
  }

  @co *updateBrushInstance(brush: comps.Brush) {
    co.cancelIfCoroutineStarted();
    // const brush = brushEntity.read(comps.Brush);
    if (brush.kind === BrushKind.Crayon) {
      if (
        this.brushInstance === null ||
        this.brushInstance.kind !== BrushKind.Crayon
      ) {
        const textures = yield* this.waitForPromise(
          PIXI.Assets.load(["crayonShape", "paintGrain"])
        );
        const shapeTexture = textures.crayonShape;
        const grainTexture = textures.paintGrain;
        this.brushInstance = new CrayonBrush(
          this.app,
          shapeTexture,
          grainTexture
        );
      }
    } else if (brush.kind === BrushKind.Smudge) {
      if (
        this.brushInstance === null ||
        this.brushInstance.kind !== BrushKind.Smudge
      ) {
        const shapeTexture = yield* this.waitForPromise(
          PIXI.Assets.load("smudge")
        );
        this.brushInstance = new SmudgeBrush(this.app, shapeTexture);
      }
    } else if (brush.kind === BrushKind.Paint) {
      if (
        this.brushInstance === null ||
        this.brushInstance.kind !== BrushKind.Paint
      ) {
        const textures = yield* this.waitForPromise(
          PIXI.Assets.load(["paintShape", "paintGrain"])
        );
        const shapeTexture = textures.paintShape;
        const grainTexture = textures.paintGrain;
        this.brushInstance = new PaintBrush(
          this.app,
          shapeTexture,
          grainTexture
        );
      }
    } else if (brush.kind === BrushKind.Marker) {
      if (
        this.brushInstance === null ||
        this.brushInstance.kind !== BrushKind.Marker
      ) {
        const textures = yield* this.waitForPromise(
          PIXI.Assets.load(["markerShape", "paintGrain"])
        );
        const shapeTexture = textures.markerShape;
        const grainTexture = textures.paintGrain;
        this.brushInstance = new MarkerBrush(
          this.app,
          shapeTexture,
          grainTexture
        );
      }
    } else {
      this.brushInstance = null;
    }

    if (this.brushInstance) {
      this.brushInstance.size = this.brush.size;
      this.brushInstance.color = hexToRgba(this.brush.color);
    }
  }
}
