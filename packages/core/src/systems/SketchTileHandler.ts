import type { Entity } from '@lastolivegames/becsy';
import { co, system } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import type { Emitter } from 'strict-event-emitter';
import { v4 as uuid } from 'uuid';

import * as comps from '../components/index.js';
import type { Events } from '../types.js';
import SketchBase from './SketchBase.js';
import SketchStrokeHandler from './SketchStrokeHandler.js';
import ViewportHandler from './ViewportHandler.js';
import { getTileImageUrl, hexToNumber, waitForPromise } from './common.js';

@system((s) => s.inAnyOrderWith(ViewportHandler, SketchStrokeHandler))
class SketchTileHandler extends SketchBase {
  public readonly app!: PIXI.Application;

  public readonly viewport!: Viewport;

  public readonly emitter!: Emitter<Events>;

  private readonly settings = this.singleton.read(comps.Settings);

  private readonly tiles = this.query(
    (q) => q.added.and.current.and.removed.and.addedOrChanged.with(comps.Tile).write.trackWrites,
  );

  private readonly tileSources = this.query(
    (q) =>
      q.added.and.current.and.removed.and.addedOrChanged.with(comps.TileSource).write.trackWrites,
  );

  @co private *applyImageToTile(tileEntity: Entity): Generator {
    const tileSprite = this.getTileSprite(tileEntity);

    if (!tileSprite) return;

    const tileSourceEntity = tileEntity.read(comps.Tile).source;
    const image = tileSourceEntity.read(comps.TileSource).image;
    if (tileSprite.texture.source.label === image) return;

    const heldTileEntity = tileEntity.hold();
    heldTileEntity.write(comps.Tile).loading = true;

    const sprite = new PIXI.Sprite();
    if (image !== '') {
      const texture = (yield* waitForPromise(
        PIXI.Assets.load({
          src: image,
          loadParser: 'loadTextures',
        }).catch(() => {
          // supressing 404 errors
        }),
      )) as PIXI.Texture | undefined;

      if (texture instanceof PIXI.Texture) {
        sprite.texture = texture;
      }
    }

    if (sprite.texture.label === 'EMPTY') {
      sprite.texture = PIXI.Texture.WHITE;
      sprite.tint = hexToNumber(this.settings.baseColor);
      sprite.width = this.settings.tileWidth;
      sprite.height = this.settings.tileHeight;
    }

    this.app.renderer.render({
      container: sprite,
      target: tileSprite.texture,
      clear: true,
    });

    tileSprite.texture.source.label = image;

    heldTileEntity.write(comps.Tile).loading = false;

    if (image.includes(this.settings.baseUrl)) {
      const i = heldTileEntity.read(comps.Tile).index;
      this.emitter.emit('tile-load', {
        index: [i[0], i[1]],
      });
    }
  }

  public execute(): void {
    // check if tiles need to be added/removed
    this.addTilesInView();
    this.unloadFarAwayTiles();

    // handle added tiles
    for (const tileEntity of this.tiles.added) {
      const tile = tileEntity.read(comps.Tile);
      const source = tile.source.read(comps.TileSource);

      const texture = PIXI.RenderTexture.create({
        width: this.settings.tileWidth,
        height: this.settings.tileHeight,
      });
      const tileSprite = new PIXI.Sprite(texture);
      tileSprite.label = source.label;
      tileSprite.position.set(tile.position[0], tile.position[1]);

      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      const tint = hexToNumber(this.settings.baseColor);
      sprite.tint = tint;
      sprite.width = this.settings.tileWidth;
      sprite.height = this.settings.tileHeight;

      this.app.renderer.render({
        container: sprite,
        target: tileSprite.texture,
        clear: true,
      });

      this.viewport.addChild(tileSprite);
    }

    // update tile sprite images
    for (const tileSourceEntity of this.tileSources.addedOrChanged) {
      const tileEntity = tileSourceEntity.read(comps.TileSource).tiles[0];
      this.applyImageToTile(tileEntity);
    }

    // remove tile sprites
    if (this.tiles.removed.length) {
      this.accessRecentlyDeletedData(true);
    }
    for (const tileEntity of this.tiles.removed) {
      const sprite = this.getTileSprite(tileEntity);
      if (!sprite) continue;

      this.viewport.removeChild(sprite);
      sprite.destroy(true);
    }
  }

  private addTilesInView(): void {
    const loadingTileEntities = this.tiles.current.filter(
      (tileEntity) => tileEntity.read(comps.Tile).loading,
    );

    if (loadingTileEntities.length > this.settings.tileLoadingConcurrency) return;

    const { tileCountX, tileCountY, tileWidth, tileHeight } = this.settings;

    // largest possible values without causing overflow
    const infX = Math.floor(2 ** 31 / tileWidth);
    const infY = Math.floor(2 ** 31 / tileHeight);

    const minX = tileCountX === 0 ? -infX : 0;
    const minY = tileCountY === 0 ? infY - 1 : tileCountY - 1;
    const maxX = tileCountX === 0 ? infX - 1 : tileCountX - 1;
    const maxY = tileCountY === 0 ? -infY : 0;

    // get tiles in view (note that top < bottom)
    const left = Math.floor(this.viewport.left / tileWidth);
    const right = Math.ceil(this.viewport.right / tileWidth);
    const top = Math.floor(this.viewport.top / tileHeight);
    const bottom = Math.ceil(this.viewport.bottom / tileHeight);

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        if (x < minX || x > maxX || y > minY || y < maxY) continue;

        const positionX = x * tileWidth;
        const positionY = y * tileHeight;

        const tileEntity = this.tiles.current.find((tileEntity2: Entity) => {
          const tile = tileEntity2.read(comps.Tile);
          return tile.position[0] === positionX && tile.position[1] === positionY;
        });

        if (tileEntity) continue;

        const sourceEntity = this.createEntity(comps.TileSource, {
          label: uuid(),
          image: getTileImageUrl(this.settings.baseUrl, x, y),
        });

        this.createEntity(comps.Tile, {
          position: [positionX, positionY],
          index: [x, y],
          source: sourceEntity,
        });

        this.applyImageToTile(sourceEntity.read(comps.TileSource).tiles[0]);
      }
    }
  }

  private unloadFarAwayTiles(): void {
    if (this.tiles.current.length <= this.settings.maxTiles) return;

    const position = this.viewport.center;

    // cant sort in place with becsy, have to create a seperate array
    const sortedTiles = this.tiles.current
      .map((tileEntity: Entity) => {
        const tile = tileEntity.read(comps.Tile);
        return {
          id: `${tile.index[0]}_${tile.index[1]}`,
          distanceSq: (position.x - tile.position[0]) ** 2 + (position.y - tile.position[1]) ** 2,
        };
      })
      .sort((a, b) => a.distanceSq - b.distanceSq);

    for (let i = this.settings.maxTiles; i < sortedTiles.length; i++) {
      const [x, y] = sortedTiles[i].id.split('_').map(Number);
      const tileEntity = this.tiles.current.find((tileEntity2: Entity) => {
        const tile = tileEntity2.read(comps.Tile);
        return tile.index[0] === x && tile.index[1] === y;
      });

      if (!tileEntity) continue;

      this.deleteEntity(tileEntity.read(comps.Tile).source);
      this.deleteEntity(tileEntity);
    }
  }
}

export default SketchTileHandler;
