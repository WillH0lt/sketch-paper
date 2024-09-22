import { co, system } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import type { Emitter } from 'strict-event-emitter';

import type PixiTile from '../PixiTile.js';
import * as comps from '../components/index.js';
import type { Events } from '../types.js';
import { BrushKindEnum as BrushKind } from '../types.js';
import SketchBase from './SketchBase.js';
import SketchFloodFillHandler from './SketchFloodFillHandler.js';
import { deleteEntity, hexToRgba, waitForPromise } from './common.js';

import type BaseBrush from '../brushes/BaseBrush.js';
import CrayonBrush from '../brushes/crayon/index.js';
import MarkerBrush from '../brushes/marker/index.js';
import PaintBrush from '../brushes/paint/index.js';
import SmudgeBrush from '../brushes/smudge/index.js';

@system((s) => s.inAnyOrderWith(SketchFloodFillHandler))
class SketchStrokeHandler extends SketchBase {
  public readonly app!: PIXI.Application;

  public readonly viewport!: Viewport;

  public readonly emitter!: Emitter<Events>;

  private readonly input = this.singleton.read(comps.Input);

  private readonly brush = this.singleton.read(comps.Brush);

  private readonly settings = this.query((q) => q.added.with(comps.Settings));

  private readonly brushes = this.query((q) => q.addedOrChanged.with(comps.Brush).trackWrites);

  private readonly strokes = this.query((q) => q.current.with(comps.Stroke).write);

  private brushInstance: BaseBrush | null = null;

  // public constructor() {
  //   super();

  //   PIXI.Assets.add([
  //     { alias: 'crayonShape', src: '/img/brushes/crayon/shape.png' },
  //     { alias: 'smudge', src: '/img/brushes/smudge/shape.png' },
  //     { alias: 'paintShape', src: '/img/brushes/paint/shape.png' },
  //     { alias: 'paintGrain', src: '/img/brushes/paint/grain.png' },
  //     { alias: 'markerShape', src: '/img/brushes/marker/shape.png' },
  //   ]);
  // }

  @co private *updateBrushInstance(brush: comps.Brush): Generator {
    co.cancelIfCoroutineStarted();
    // const brush = brushEntity.read(comps.Brush);
    if (brush.kind === BrushKind.Crayon) {
      if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Crayon) {
        const textures = (yield* waitForPromise(
          PIXI.Assets.load(['crayonShape', 'paintGrain']),
        )) as { crayonShape: PIXI.Texture; paintGrain: PIXI.Texture };

        this.brushInstance = new CrayonBrush(this.app, textures.crayonShape, textures.paintGrain);
      }
    } else if (brush.kind === BrushKind.Smudge) {
      if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Smudge) {
        const shapeTexture = (yield* waitForPromise(PIXI.Assets.load('smudge'))) as PIXI.Texture;
        this.brushInstance = new SmudgeBrush(this.app, shapeTexture);
      }
    } else if (brush.kind === BrushKind.Paint) {
      if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Paint) {
        const textures = (yield* waitForPromise(
          PIXI.Assets.load(['paintShape', 'paintGrain']),
        )) as {
          paintShape: PIXI.Texture;
          paintGrain: PIXI.Texture;
        };
        const shapeTexture = textures.paintShape;
        const grainTexture = textures.paintGrain;
        this.brushInstance = new PaintBrush(this.app, shapeTexture, grainTexture);
      }
    } else if (brush.kind === BrushKind.Marker) {
      if (this.brushInstance === null || this.brushInstance.kind !== BrushKind.Marker) {
        const textures = (yield* waitForPromise(
          PIXI.Assets.load(['markerShape', 'paintGrain']),
        )) as { markerShape: PIXI.Texture; paintGrain: PIXI.Texture };
        const shapeTexture = textures.markerShape;
        const grainTexture = textures.paintGrain;
        this.brushInstance = new MarkerBrush(this.app, shapeTexture, grainTexture);
      }
    } else {
      this.brushInstance = null;
    }

    if (this.brushInstance) {
      this.brushInstance.size = this.brush.size;
      this.brushInstance.color = hexToRgba(this.brush.color);
    }
  }

  public execute(): void {
    if (this.settings.added.length > 0) {
      const settings = this.settings.added[0].read(comps.Settings);
      PIXI.Assets.add([
        { alias: 'crayonShape', src: `${settings.assetsPath}/brushes/crayon/shape.png` },
        { alias: 'smudge', src: `${settings.assetsPath}/brushes/smudge/shape.png` },
        { alias: 'paintShape', src: `${settings.assetsPath}/brushes/paint/shape.png` },
        { alias: 'paintGrain', src: `${settings.assetsPath}/brushes/paint/grain.png` },
        { alias: 'markerShape', src: `${settings.assetsPath}/brushes/marker/shape.png` },
      ]);
    }

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
      const sprites = this.renderStroke(stroke.prevPoint, this.input.pointerWorld);
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
        deleteEntity(strokeEntity);
      }

      this.brushInstance?.reset();
    }
  }

  private renderStroke(prevPoint: [number, number], currentPoint: [number, number]): PixiTile[] {
    if (!this.brushInstance) return [];

    const intersectedA = this.getIntersectedTiles(prevPoint);
    const intersectedB = this.getIntersectedTiles(currentPoint);

    // get union of A and B
    const intersected = intersectedA
      .concat(intersectedB)
      .filter((tile, index, self) => index === self.findIndex((t) => t === tile));

    for (const tile of intersected) {
      this.brushInstance.draw(prevPoint, currentPoint, tile);
    }

    if (intersected.length > 0) {
      this.emitter.emit('draw', {
        startX: prevPoint[0],
        startY: prevPoint[1],
        endX: currentPoint[0],
        endY: currentPoint[1],
      });
    }

    return intersected;
  }
}

export default SketchStrokeHandler;
