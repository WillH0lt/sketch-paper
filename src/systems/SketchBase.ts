import { co, Entity } from "@lastolivegames/becsy";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

import * as comps from "../components";
import { BaseSystem } from "./Base";
import { PixiPage } from "../PixiPage";

export class SketchBase extends BaseSystem {
  private readonly _settings = this.singleton.read(comps.Settings);

  private readonly _pages = this.query((q) => q.current.with(comps.Page).write);

  // injected via world defs
  protected readonly app!: PIXI.Application;
  protected readonly viewport!: Viewport;

  getPixiPage(pageEntity: Entity): PixiPage | null {
    const page = pageEntity.read(comps.Page);
    return this.viewport.children.find(
      (child) => child.label === page.label
    ) as PixiPage;
  }

  getPageEntity(pixiPage: PIXI.Container): Entity | null {
    for (const pageEntity of this._pages.current) {
      const page = pageEntity.read(comps.Page);
      if (pixiPage.label === page.label) {
        return pageEntity;
      }
    }

    return null;
  }

  getIntersectedPages(point: [number, number], tolerance = 40): PixiPage[] {
    const x = point[0];
    const y = point[1];
    const w = this._settings.tileWidth;
    const h = this._settings.tileHeight;

    const intersected: PixiPage[] = [];
    for (const pageEntity of this._pages.current) {
      const page = pageEntity.read(comps.Page);

      if (
        y <= page.position[1] + h + tolerance &&
        y >= page.position[1] - tolerance &&
        x <= page.position[0] + w + tolerance &&
        x >= page.position[0] - tolerance
      ) {
        const pixiPage = this.getPixiPage(pageEntity);
        if (pixiPage) intersected.push(pixiPage);
      }
    }

    return intersected;
  }

  @co *snapshotPages(pageEntities: Entity[]) {
    if (pageEntities.length === 0) return;

    co.scope(pageEntities[0]);
    co.cancelIfCoroutineStarted();
    co.waitForSeconds(0.15);

    this.app.stop();

    const pixiPages = pageEntities.map((pageEntity) =>
      this.getPixiPage(pageEntity)
    );
    for (const pixiPage of pixiPages) {
      if (!pixiPage) continue;

      const url = yield* this.waitForPromise(
        this.app.renderer.extract.base64(pixiPage.texture)
      );
      const res = yield* this.waitForPromise(fetch(url));
      const img = yield* this.waitForPromise(res.blob());
      const blob = new Blob([img], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      const pageEntity = this.getPageEntity(pixiPage);
      if (!pageEntity) continue;

      const page = pageEntity.write(comps.Page);
      page.image = blobUrl;

      pixiPage.texture.source.label = blobUrl;
    }

    this.app.start();

    this.createSnapshot();
  }
}
