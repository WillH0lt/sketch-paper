import type { Entity } from '@lastolivegames/becsy';
import { co, system } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { v4 as uuid } from 'uuid';

import PixiTile from '../PixiTile.js';
import * as comps from '../components/index.js';
import SketchBase from './SketchBase.js';
import SketchFloodFillHandler from './SketchFloodFillHandler.js';
import SketchShapeHandler from './SketchShapeHandler.js';
import SketchStrokeHandler from './SketchStrokeHandler.js';
import ViewportHandler from './ViewportHandler.js';
import { waitForPromise } from './common.js';

@system((s) =>
  s.inAnyOrderWith(
    ViewportHandler,
    SketchStrokeHandler,
    SketchShapeHandler,
    SketchFloodFillHandler,
  ),
)
class SketchTileHandler extends SketchBase {
  public readonly app!: PIXI.Application;

  public readonly viewport!: Viewport;

  private readonly settings = this.singleton.read(comps.Settings);

  private readonly tiles = this.query(
    (q) => q.added.and.current.and.removed.and.addedOrChanged.with(comps.Tile).write.trackWrites,
  );

  private readonly tileSources = this.query(
    (q) =>
      q.added.and.current.and.removed.and.addedOrChanged.with(comps.TileSource).write.trackWrites,
  );

  @co private *applyImageToTile(tileEntity: Entity): Generator {
    const pixiTile = this.getPixiTile(tileEntity);

    if (!pixiTile) return;

    const tileSourceEntity = tileEntity.read(comps.Tile).source;
    const image = tileSourceEntity.read(comps.TileSource).image;
    if (pixiTile.texture.source.label === image) return;

    const heldTileEntity = tileEntity.hold();
    heldTileEntity.write(comps.Tile).loading = true;

    let tmpSprite: PIXI.Sprite | null = null;
    if (image === '') {
      tmpSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      tmpSprite.width = this.settings.tileWidth;
      tmpSprite.height = this.settings.tileHeight;
    } else {
      const texture = (yield* waitForPromise(
        PIXI.Assets.load({
          src: image,
          loadParser: 'loadTextures',
        }),
      )) as PIXI.Texture;

      tmpSprite = new PIXI.Sprite();
      tmpSprite.texture = texture;
    }

    this.app.renderer.render({
      container: tmpSprite,
      target: pixiTile.texture,
      clear: true,
    });

    pixiTile.texture.source.label = image;
    // yield* this.waitForPromise(PIXI.Assets.unload(image));

    heldTileEntity.write(comps.Tile).loading = false;
  }

  public execute(): void {
    // check if tiles need to be added
    this.addTilesInView();

    // handle added tiles
    for (const tileEntity of this.tiles.added) {
      const tile = tileEntity.read(comps.Tile);
      const source = tile.source.read(comps.TileSource);

      const pixiTile = new PixiTile(this.settings.tileWidth, this.settings.tileHeight);
      pixiTile.label = source.label;
      pixiTile.position.set(tile.position[0], tile.position[1]);

      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      // sprite.tint = Math.random() * 0xffffff;
      sprite.tint = 0x000000;
      sprite.width = this.settings.tileWidth;
      sprite.height = this.settings.tileHeight;

      this.app.renderer.render({
        container: sprite,
        target: pixiTile.texture,
        clear: true,
      });

      this.viewport.addChild(pixiTile);
    }

    // update tile sprite positions and images
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

    if (loadingTileEntities.length) return;

    const { tileWidth, tileHeight } = this.settings;

    // get tiles in view (note that top < bottom)
    const left = Math.floor(this.viewport.left / tileWidth);
    const right = Math.ceil(this.viewport.right / tileWidth);
    const top = Math.floor(this.viewport.top / tileHeight);
    const bottom = Math.ceil(this.viewport.bottom / tileHeight);

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        const positionX = x * tileWidth;
        const positionY = y * tileHeight;

        const tileEntity = this.tiles.current.find((tileEntity2: Entity) => {
          const tile = tileEntity2.read(comps.Tile);
          return tile.position[0] === positionX && tile.position[1] === positionY;
        });

        if (tileEntity) continue;

        const sourceEntity = this.createEntity(comps.TileSource, {
          label: uuid(),
        });

        this.createEntity(comps.Tile, {
          // label: uuid(),
          position: [positionX, positionY],
          source: sourceEntity,
        });
      }
    }
  }
}

export default SketchTileHandler;
