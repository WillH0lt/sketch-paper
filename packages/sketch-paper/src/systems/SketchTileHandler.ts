import { system, co, Entity } from "@lastolivegames/becsy";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { v4 as uuid } from "uuid";

import * as comps from "../components";
import * as sys from "../systems";
import { SketchBase } from "./SketchBase";
import { PixiTile } from "../PixiTile";

@system((s) =>
  s.inAnyOrderWith(
    sys.ViewportHandler,
    sys.SketchStrokeHandler,
    sys.SketchShapeHandler,
    sys.SketchFloodFillHandler
  )
)
export class SketchTileHandler extends SketchBase {
  private readonly settings = this.singleton.read(comps.Settings);

  private readonly tiles = this.query(
    (q) =>
      q.added.and.current.and.removed.and.addedOrChanged.with(comps.Tile).write
        .trackWrites
  );

  private readonly tileSources = this.query(
    (q) =>
      q.added.and.current.and.removed.and.addedOrChanged.with(comps.TileSource)
        .write.trackWrites
  );

  protected readonly app!: PIXI.Application;
  protected readonly viewport!: Viewport;

  execute(): void {
    // check if tiles need to be added
    this.addTilesInView();

    // handle added tiles
    for (const tileEntity of this.tiles.added) {
      const tile = tileEntity.read(comps.Tile);
      const source = tile.source.read(comps.TileSource);

      const pixiTile = new PixiTile(
        this.settings.tileWidth,
        this.settings.tileHeight
      );
      pixiTile.label = source.label;
      pixiTile.position.set(tile.position[0], tile.position[1]);

      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      // sprite.tint = Math.random() * 0xffffff;
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

  addTilesInView() {
    const loadingTileEntities = this.tiles.current.filter(
      (tileEntity) => tileEntity.read(comps.Tile).loading
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

        const tileEntity = this.tiles.current.find((tileEntity) => {
          const tile = tileEntity.read(comps.Tile);
          return (
            tile.position[0] === positionX && tile.position[1] === positionY
          );
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

  @co *applyImageToTile(tileEntity: Entity) {
    const pixiTile = this.getPixiTile(tileEntity);

    if (!pixiTile) return;

    const tileSourceEntity = tileEntity.read(comps.Tile).source;
    const image = tileSourceEntity.read(comps.TileSource).image;
    if (pixiTile.texture.source.label === image) return;

    const heldTileEntity = tileEntity.hold();
    heldTileEntity.write(comps.Tile).loading = true;

    let tmpSprite: PIXI.Sprite;
    if (image === "") {
      tmpSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      tmpSprite.width = this.settings.tileWidth;
      tmpSprite.height = this.settings.tileHeight;
    } else {
      const texture = yield* this.waitForPromise(
        PIXI.Assets.load({
          src: image,
          loadParser: "loadTextures",
        })
      );

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
}
