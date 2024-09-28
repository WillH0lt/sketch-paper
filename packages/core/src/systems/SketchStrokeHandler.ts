import { co, system } from '@lastolivegames/becsy';
import type { BaseBrush } from '@sketchy-draw/brushes';
import { CrayonBrush } from '@sketchy-draw/brushes';
import type { Viewport } from 'pixi-viewport';
import type * as PIXI from 'pixi.js';
import type { Emitter } from 'strict-event-emitter';

import * as comps from '../components/index.js';
import type { DrawSegment, Events } from '../types.js';
import SketchBase from './SketchBase.js';
import { deleteEntity, hexToRgba, waitForPromise } from './common.js';

@system
class SketchStrokeHandler extends SketchBase {
  public readonly app!: PIXI.Application;

  public readonly viewport!: Viewport;

  public readonly emitter!: Emitter<Events>;

  private readonly input = this.singleton.read(comps.Input);

  private readonly brush = this.singleton.read(comps.Brush);

  private readonly brushes = this.query((q) => q.addedOrChanged.with(comps.Brush).trackWrites);

  private readonly strokes = this.query((q) => q.current.with(comps.Stroke).write);

  private readonly tiles = this.query((q) => q.current.with(comps.Tile));

  private brushInstance: BaseBrush | null = null;

  @co private *updateBrushInstance(): Generator {
    co.cancelIfCoroutineStarted();

    this.brushInstance = new CrayonBrush(this.app);
    yield* waitForPromise(this.brushInstance.init());

    // if (brush.kind === BrushKind.Crayon) {
    //   if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Crayon) {
    //     const textures = (yield* waitForPromise(
    //       PIXI.Assets.load(['crayonShape', 'paintGrain']),
    //     )) as { crayonShape: PIXI.Texture; paintGrain: PIXI.Texture };

    //     this.brushInstance = new CrayonBrush(this.app, textures.crayonShape, textures.paintGrain);
    //   }
    // } else if (brush.kind === BrushKind.Smudge) {
    //   if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Smudge) {
    //     const shapeTexture = (yield* waitForPromise(PIXI.Assets.load('smudge'))) as PIXI.Texture;
    //     this.brushInstance = new SmudgeBrush(this.app, shapeTexture);
    //   }
    // } else if (brush.kind === BrushKind.Paint) {
    //   if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Paint) {
    //     const textures = (yield* waitForPromise(
    //       PIXI.Assets.load(['paintShape', 'paintGrain']),
    //     )) as {
    //       paintShape: PIXI.Texture;
    //       paintGrain: PIXI.Texture;
    //     };
    //     const shapeTexture = textures.paintShape;
    //     const grainTexture = textures.paintGrain;
    //     this.brushInstance = new PaintBrush(this.app, shapeTexture, grainTexture);
    //   }
    // } else if (brush.kind === BrushKind.Marker) {
    //   if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Marker) {
    //     const textures = (yield* waitForPromise(
    //       PIXI.Assets.load(['markerShape', 'paintGrain']),
    //     )) as { markerShape: PIXI.Texture; paintGrain: PIXI.Texture };
    //     const shapeTexture = textures.markerShape;
    //     const grainTexture = textures.paintGrain;
    //     this.brushInstance = new MarkerBrush(this.app, shapeTexture, grainTexture);
    //   }
    // } else {
    //   this.brushInstance = null;
    // }

    // if (this.brushInstance) {
    this.brushInstance.size = this.brush.size;
    this.brushInstance.color = hexToRgba(this.brush.color);
    // }
  }

  @co private *handleDrawIncoming(segment: DrawSegment): Generator {
    for (const tileEntity of this.tiles.current) {
      const tile = tileEntity.read(comps.Tile);
      if (tile.index[0] !== segment.tileX || tile.index[1] !== segment.tileY) continue;

      const tileSprite = this.getTileSprite(tileEntity);
      if (!tileSprite) continue;

      this.brushInstance?.draw(
        [segment.startX, segment.startY],
        [segment.endX, segment.endY],
        tileSprite,
      );
    }

    yield;
  }

  public initialize(): void {
    super.initialize();

    this.emitter.on('draw-incoming', (segment: DrawSegment) => {
      this.handleDrawIncoming(segment);
    });
  }

  public execute(): void {
    for (const brushEntity of this.brushes.addedOrChanged) {
      // TODO pass brush to updateBrushInstance
      brushEntity.read(comps.Brush);
      this.updateBrushInstance();
    }

    if (this.input.pointerDownTrigger) {
      if (this.brushInstance) {
        this.createEntity(comps.Stroke, {
          prevPoint: this.input.pointerWorld,
        });

        this.brushInstance.onStrokeStart();
      }
    }

    // render strokes
    for (const strokeEntity of this.strokes.current) {
      const stroke = strokeEntity.write(comps.Stroke);

      const start = [stroke.prevPoint[0], stroke.prevPoint[1]] as [number, number];
      const end = [
        Math.round(this.input.pointerWorld[0]),
        Math.round(this.input.pointerWorld[1]),
      ] as [number, number];
      stroke.prevPoint = this.input.pointerWorld;

      const intersectedA = this.getIntersectedTileSprites(start);
      const intersectedB = this.getIntersectedTileSprites(end);

      // get union of A and B
      const tilesSprites = intersectedA
        .concat(intersectedB)
        .filter((tile, index, self) => index === self.findIndex((t) => t === tile));

      for (const tileSprite of tilesSprites) {
        const tileEntity = this.getTileEntity(tileSprite);
        if (!tileEntity) continue;

        const tile = tileEntity.write(comps.Tile);
        tile.strokeEntity = strokeEntity;

        const segment = {
          tileX: tile.index[0],
          tileY: tile.index[1],
          startX: start[0],
          startY: start[1],
          endX: end[0],
          endY: end[1],
        };

        this.brushInstance?.draw(
          [segment.startX, segment.startY],
          [segment.endX, segment.endY],
          tileSprite,
        );
        this.emitter.emit('draw-outgoing', segment);
      }
    }

    // delete strokes on pointer up
    if (this.input.pointerUpTrigger) {
      for (const strokeEntity of this.strokes.current) {
        const stroke = strokeEntity.read(comps.Stroke);
        this.snapshotTiles(stroke.tiles);
        deleteEntity(strokeEntity);
      }

      this.brushInstance?.onStrokeEnd();
    }
  }
}

export default SketchStrokeHandler;
