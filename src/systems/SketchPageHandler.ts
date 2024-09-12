import { system, co, Entity } from "@lastolivegames/becsy";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";

import * as comps from "../components";
import * as sys from "../systems";
import { SketchBase } from "./SketchBase";
import { PixiPage } from "../PixiPage";

@system((s) =>
  s.inAnyOrderWith(
    sys.ViewportHandler,
    sys.SketchStrokeHandler,
    sys.SketchShapeHandler,
    sys.SketchFloodFillHandler
  )
)
export class SketchPageHandler extends SketchBase {
  private readonly settings = this.singleton.read(comps.Settings);

  private readonly pages = this.query(
    (q) =>
      q.added.and.current.and.removed.and.addedOrChanged.with(comps.Page).write
        .trackWrites
  );

  protected readonly app!: PIXI.Application;
  protected readonly viewport!: Viewport;

  execute(): void {
    // add pages
    for (const pageEntity of this.pages.added) {
      const page = pageEntity.read(comps.Page);

      const pixiPage = new PixiPage(
        this.settings.tileWidth,
        this.settings.tileHeight
      );
      pixiPage.label = page.label;

      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      sprite.tint = Math.random() * 0xffffff;
      sprite.width = this.settings.tileWidth;
      sprite.height = this.settings.tileHeight;

      this.app.renderer.render({
        container: sprite,
        target: pixiPage.texture,
        clear: true,
      });

      this.viewport.addChild(pixiPage);
    }

    // update page sprite positions and images
    for (const pageEntity of this.pages.addedOrChanged) {
      const pixiPage = this.getPixiPage(pageEntity);
      if (!pixiPage) continue;

      const page = pageEntity.read(comps.Page);
      pixiPage.position.set(page.position[0], page.position[1]);

      this.applyImageToPage(pageEntity);
    }

    // remove page sprites
    if (this.pages.removed.length) {
      this.accessRecentlyDeletedData(true);
    }
    for (const pageEntity of this.pages.removed) {
      const pixiPage = this.getPixiPage(pageEntity);
      if (!pixiPage) continue;
      this.viewport.removeChild(pixiPage);
      pixiPage.destroy({
        children: true,
      });
    }
  }

  @co *applyImageToPage(pageEntity: Entity) {
    const pixiPage = this.getPixiPage(pageEntity);

    if (!pixiPage) return;

    const image = pageEntity.read(comps.Page).image;

    if (pixiPage.texture.source.label === image) return;

    let tmpSprite: PIXI.Sprite;
    if (image === "") {
      tmpSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      tmpSprite.width = this.settings.tileWidth;
      tmpSprite.height = this.settings.tileHeight;
    } else {
      yield* this.waitForPromise(
        PIXI.Assets.load({
          src: image,
          loadParser: "loadTextures",
        })
      );

      tmpSprite = new PIXI.Sprite();
      tmpSprite.texture = PIXI.Texture.from(image);
    }

    this.app.renderer.render({
      container: tmpSprite,
      target: pixiPage.texture,
      clear: true,
    });

    pixiPage.texture.source.label = image;
    // this.render();

    yield* this.waitForPromise(PIXI.Assets.unload(image));
  }
}
