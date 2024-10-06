import type { Entity } from '@lastolivegames/becsy';
import { co } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';

import * as comps from '../components/index.js';
import BaseSystem from './Base.js';
import { waitForPromise } from './common.js';

class SketchBase extends BaseSystem {
  protected readonly app!: PIXI.Application;

  protected readonly viewport!: Viewport;

  private readonly _tiles = this.query((q) => q.current.with(comps.Tile).write);

  // @ts-ignore
  private readonly _tileSources = this.query((q) => q.current.with(comps.TileSource).write);

  @co protected *snapshotTiles(tileEntities: Entity[]): Generator {
    if (tileEntities.length === 0) return;

    co.scope(tileEntities[0]);
    co.cancelIfCoroutineStarted();
    co.waitForSeconds(0.15);

    this.app.stop();

    const tileSprites = tileEntities.map((tileEntity) => this.getTileSprite(tileEntity));
    for (const tileSprite of tileSprites) {
      if (!tileSprite) continue;

      const url = (yield* waitForPromise(
        this.app.renderer.extract.base64(tileSprite.texture),
      )) as string;
      const res = (yield* waitForPromise(fetch(url))) as Response;
      const img = (yield* waitForPromise(res.blob())) as Blob;
      const blob = new Blob([img], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      const tileEntity = this.getTileEntity(tileSprite);
      if (!tileEntity) continue;

      const tileSource = tileEntity.read(comps.Tile).source.write(comps.TileSource);
      tileSource.image = blobUrl;

      tileSprite.texture.source.label = blobUrl;
    }

    this.app.start();

    this.createSnapshot();
  }

  protected getTileSprite(tileEntity: Entity): PIXI.Sprite | null {
    const { label } = tileEntity.read(comps.Tile).source.read(comps.TileSource);
    const sprite = this.viewport.children.find((child) => child.label === label);
    if (sprite instanceof PIXI.Sprite) return sprite;
    return null;
  }

  protected getTileEntity(tileSprite: PIXI.Sprite): Entity | null {
    for (const tileEntity of this._tiles.current) {
      const { label } = tileEntity.read(comps.Tile).source.read(comps.TileSource);
      if (tileSprite.label === label) {
        return tileEntity;
      }
    }

    return null;
  }
}

export default SketchBase;
