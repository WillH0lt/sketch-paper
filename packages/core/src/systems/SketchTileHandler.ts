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
      )) as PIXI.Texture | { error: unknown };

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
    // check if tiles need to be added
    this.addTilesInView();

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

    // // remove tile sprites
    // if (this.tiles.removed.length) {
    //   this.accessRecentlyDeletedData(true);
    // }
    // for (const tileEntity of this.tiles.removed) {
    //   const pixiTile = this.getPixiTile(tileEntity);
    //   if (!pixiTile) continue;
    //   this.viewport.removeChild(pixiTile);
    //   pixiTile.destroy({
    //     children: true,
    //   });
    // }
  }

  private addTilesInView(): void {
    const loadingTileEntities = this.tiles.current.filter(
      (tileEntity) => tileEntity.read(comps.Tile).loading,
    );

    if (loadingTileEntities.length > 3) return;

    const { tileCountX, tileCountY, tileWidth, tileHeight } = this.settings;

    const minX = tileCountX === 0 ? -Infinity : 0;
    const minY = tileCountY === 0 ? Infinity : tileCountY - 1;
    const maxX = tileCountX === 0 ? Infinity : tileCountX - 1;
    const maxY = tileCountY === 0 ? -Infinity : 0;

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
}

export default SketchTileHandler;
