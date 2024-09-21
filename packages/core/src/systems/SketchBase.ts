import type { Entity } from '@lastolivegames/becsy';
import { co } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import type * as PIXI from 'pixi.js';

import type PixiTile from '../PixiTile.js';
import * as comps from '../components/index.js';
import BaseSystem from './Base.js';
import { waitForPromise } from './common.js';

class SketchBase extends BaseSystem {
  protected readonly app!: PIXI.Application;

  protected readonly viewport!: Viewport;

  private readonly _settings = this.singleton.read(comps.Settings);

  private readonly _tiles = this.query((q) => q.current.with(comps.Tile).write);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly _tileSources = this.query((q) => q.current.with(comps.TileSource).write);

  @co protected *snapshotTiles(tileEntities: Entity[]): Generator {
    if (tileEntities.length === 0) return;

    co.scope(tileEntities[0]);
    co.cancelIfCoroutineStarted();
    co.waitForSeconds(0.15);

    this.app.stop();

    const pixiTiles = tileEntities.map((tileEntity) => this.getPixiTile(tileEntity));
    for (const pixiTile of pixiTiles) {
      if (!pixiTile) continue;

      const url = (yield* waitForPromise(
        this.app.renderer.extract.base64(pixiTile.texture),
      )) as string;
      const res = (yield* waitForPromise(fetch(url))) as Response;
      const img = (yield* waitForPromise(res.blob())) as Blob;
      const blob = new Blob([img], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      const tileEntity = this.getTileEntity(pixiTile);
      if (!tileEntity) continue;

      const tileSource = tileEntity.read(comps.Tile).source.write(comps.TileSource);
      tileSource.image = blobUrl;

      pixiTile.texture.source.label = blobUrl;
    }

    this.app.start();

    this.createSnapshot();
  }

  protected getPixiTile(tileEntity: Entity): PixiTile | null {
    const { label } = tileEntity.read(comps.Tile).source.read(comps.TileSource);
    return this.viewport.children.find((child) => child.label === label) as PixiTile;
  }

  protected getTileEntity(pixiTile: PIXI.Container): Entity | null {
    for (const tileEntity of this._tiles.current) {
      const { label } = tileEntity.read(comps.Tile).source.read(comps.TileSource);
      if (pixiTile.label === label) {
        return tileEntity;
      }
    }

    return null;
  }

  protected getIntersectedTiles(point: [number, number], tolerance = 40): PixiTile[] {
    const x = point[0];
    const y = point[1];
    const w = this._settings.tileWidth;
    const h = this._settings.tileHeight;

    const intersected: PixiTile[] = [];
    this._tiles.current.forEach((tileEntity) => {
      const tile = tileEntity.read(comps.Tile);

      if (
        y <= tile.position[1] + h + tolerance &&
        y >= tile.position[1] - tolerance &&
        x <= tile.position[0] + w + tolerance &&
        x >= tile.position[0] - tolerance
      ) {
        const pixiTile = this.getPixiTile(tileEntity);
        if (pixiTile) intersected.push(pixiTile);
      }
    });

    return intersected;
  }
}

export default SketchBase;
