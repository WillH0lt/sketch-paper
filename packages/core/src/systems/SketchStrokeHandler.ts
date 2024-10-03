import { co, system } from '@lastolivegames/becsy';
import type { BaseBrush } from '@sketch-paper/brushes';
import type { Viewport } from 'pixi-viewport';
import type * as PIXI from 'pixi.js';
import type { Emitter } from 'strict-event-emitter';

import * as comps from '../components/index.js';
import type { BrushKindEnum, DrawSegment, Events } from '../types.js';
import SketchBase from './SketchBase.js';
import { deleteEntity } from './common.js';

@system
class SketchStrokeHandler extends SketchBase {
  public readonly app!: PIXI.Application;

  public readonly viewport!: Viewport;

  public readonly emitter!: Emitter<Events>;

  private readonly input = this.singleton.read(comps.Input);

  private readonly brush = this.singleton.read(comps.Brush);

  private readonly settings = this.singleton.read(comps.Settings);

  private readonly strokes = this.query((q) => q.current.with(comps.Stroke).write);

  private readonly tiles = this.query((q) => q.current.with(comps.Tile));

  private readonly brushInstances = new Map<BrushKindEnum, BaseBrush>();

  @co private *handleDrawIncoming(segments: DrawSegment[]): Generator {
    const groupedSegments = new Map<string, DrawSegment[]>();
    for (const segment of segments) {
      const key = `${segment.tileX},${segment.tileY}`;
      if (!groupedSegments.has(key)) {
        groupedSegments.set(key, []);
      }

      groupedSegments.get(key)?.push(segment);
    }

    for (const [key, segmentGroup] of groupedSegments) {
      const [tileX, tileY] = key.split(',').map(Number);
      for (const tileEntity of this.tiles.current) {
        const tile = tileEntity.read(comps.Tile);
        if (tile.position[0] !== tileX || tile.position[1] !== tileY || tile.loading) continue;

        const tileSprite = this.getTileSprite(tileEntity);
        if (!tileSprite) continue;

        for (const segment of segmentGroup) {
          const brush = this.brushInstances.get(segment.kind);
          brush?.draw(segment, tileSprite.texture);
        }
      }
    }

    yield;
  }

  public initialize(): void {
    super.initialize();

    this.emitter.on('draw-incoming', (segments: DrawSegment[]) => {
      this.handleDrawIncoming(segments);
    });
  }

  public execute(): void {
    if (this.input.pointerDownTrigger) {
      console.log('====', this.brush.kind);
      const brush = this.brushInstances.get(this.brush.kind);

      if (brush) {
        this.createEntity(comps.Stroke, {
          prevPoint: this.input.pointerWorld,
        });

        brush.onStrokeStart();
      }
    }

    // render strokes
    for (const strokeEntity of this.strokes.current) {
      const brush = this.brushInstances.get(this.brush.kind);
      if (!brush) continue;

      const stroke = strokeEntity.write(comps.Stroke);

      const start = [stroke.prevPoint[0], stroke.prevPoint[1]] as [number, number];
      const end = [
        Math.round(this.input.pointerWorld[0]),
        Math.round(this.input.pointerWorld[1]),
      ] as [number, number];
      stroke.prevPoint = this.input.pointerWorld;

      const intersectedA = this.getIntersectedTileSprites(start, (1.4 * this.brush.size) / 2);
      const intersectedB = this.getIntersectedTileSprites(end, (1.4 * this.brush.size) / 2);

      // get union of A and B
      const tilesSprites = intersectedA
        .concat(intersectedB)
        .filter((tile, index, self) => index === self.findIndex((t) => t === tile));

      const segments = [];
      for (const tileSprite of tilesSprites) {
        const tileEntity = this.getTileEntity(tileSprite);
        if (!tileEntity) continue;

        const tile = tileEntity.write(comps.Tile);
        tile.strokeEntity = strokeEntity;

        const segment = {
          tileX: tileSprite.position.x,
          tileY: tileSprite.position.y,
          startX: start[0],
          startY: start[1],
          endX: end[0],
          endY: end[1],
          red: this.brush.red,
          green: this.brush.green,
          blue: this.brush.blue,
          alpha: this.brush.alpha,
          size: this.brush.size,
          kind: this.brush.kind,
        };

        brush.draw(segment, tileSprite.texture);
        segments.push(segment);
      }

      if (segments.length > 0) {
        this.emitter.emit('draw-outgoing', segments);
      }
    }

    // delete strokes on pointer up
    if (this.input.pointerUpTrigger) {
      const brush = this.brushInstances.get(this.brush.kind);
      if (brush) {
        for (const strokeEntity of this.strokes.current) {
          const stroke = strokeEntity.read(comps.Stroke);
          this.snapshotTiles(stroke.tiles);
          deleteEntity(strokeEntity);
        }
        brush.onStrokeEnd();
      }
    }
  }

  protected getIntersectedTileSprites(point: [number, number], tolerance: number): PIXI.Sprite[] {
    const x = point[0];
    const y = point[1];
    const w = this.settings.tileWidth;
    const h = this.settings.tileHeight;

    const intersected: PIXI.Sprite[] = [];
    this.tiles.current.forEach((tileEntity) => {
      const tile = tileEntity.read(comps.Tile);

      if (
        y <= tile.position[1] + h + tolerance &&
        y >= tile.position[1] - tolerance &&
        x <= tile.position[0] + w + tolerance &&
        x >= tile.position[0] - tolerance
      ) {
        const tileSprite = this.getTileSprite(tileEntity);
        if (tileSprite) intersected.push(tileSprite);
      }
    });

    return intersected;
  }
}

export default SketchStrokeHandler;
