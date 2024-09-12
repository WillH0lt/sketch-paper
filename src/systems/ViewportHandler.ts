import { System, system } from "@lastolivegames/becsy";
import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

@system
export class ViewportHandler extends System {
  private resized = true;

  // injected via world defs
  app!: PIXI.Application;
  container!: HTMLElement;
  viewport!: Viewport;

  initialize(): void {
    const observer = new ResizeObserver(() => {
      this.resized = true;
    });
    observer.observe(this.container!);
  }

  execute(): void {
    this.viewport.update(this.delta);

    if (this.resized) {
      this.app.renderer.resize(
        this.container!.clientWidth,
        this.container!.clientHeight
      );
      this.viewport.resize(
        this.container!.clientWidth,
        this.container!.clientHeight
      );

      this.resized = false;
    }

    this.app.renderer.render(this.app.stage);
  }
}
