import { co, Entity } from "@lastolivegames/becsy";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

import * as comps from "../components";
import { BaseSystem } from "./Base";
import { PixiTile } from "../PixiTile";

export class SketchBase extends BaseSystem {
  private readonly _settings = this.singleton.read(comps.Settings);

  private readonly _tiles = this.query((q) => q.current.with(comps.Tile).write);

  private readonly _tileSources = this.query(
    (q) => q.current.with(comps.TileSource).write
  );

  // injected via world defs
  protected readonly app!: PIXI.Application;
  protected readonly viewport!: Viewport;

  getPixiTile(tileEntity: Entity): PixiTile | null {
    const { label } = tileEntity.read(comps.Tile).source.read(comps.TileSource);
    return this.viewport.children.find(
      (child) => child.label === label
    ) as PixiTile;
  }

  getTileEntity(pixiTile: PIXI.Container): Entity | null {
    for (const tileEntity of this._tiles.current) {
      const { label } = tileEntity
        .read(comps.Tile)
        .source.read(comps.TileSource);
      if (pixiTile.label === label) {
        return tileEntity;
      }
    }

    return null;
  }

  getIntersectedTiles(point: [number, number], tolerance = 40): PixiTile[] {
    const x = point[0];
    const y = point[1];
    const w = this._settings.tileWidth;
    const h = this._settings.tileHeight;

    const intersected: PixiTile[] = [];
    for (const tileEntity of this._tiles.current) {
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
    }

    return intersected;
  }

  @co *snapshotTiles(tileEntities: Entity[]) {
    if (tileEntities.length === 0) return;

    co.scope(tileEntities[0]);
    co.cancelIfCoroutineStarted();
    co.waitForSeconds(0.15);

    this.app.stop();

    const pixiTiles = tileEntities.map((tileEntity) =>
      this.getPixiTile(tileEntity)
    );
    for (const pixiTile of pixiTiles) {
      if (!pixiTile) continue;

      const url = yield* this.waitForPromise(
        this.app.renderer.extract.base64(pixiTile.texture)
      );
      const res = yield* this.waitForPromise(fetch(url));
      const img = yield* this.waitForPromise(res.blob());
      const blob = new Blob([img], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      const tileEntity = this.getTileEntity(pixiTile);
      if (!tileEntity) continue;

      const tileSource = tileEntity
        .read(comps.Tile)
        .source.write(comps.TileSource);
      tileSource.image = blobUrl;

      pixiTile.texture.source.label = blobUrl;
    }

    this.app.start();

    this.createSnapshot();
  }
}
