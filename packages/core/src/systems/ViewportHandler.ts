import { System, system } from '@lastolivegames/becsy';
import type { Viewport } from 'pixi-viewport';
import type * as PIXI from 'pixi.js';

@system
class ViewportHandler extends System {
  public app!: PIXI.Application;

  public container!: HTMLElement;

  public viewport!: Viewport;

  private resized = true;

  public initialize(): void {
    const observer = new ResizeObserver(() => {
      this.resized = true;
    });
    observer.observe(this.container);
  }

  public execute(): void {
    this.viewport.update(this.delta);

    if (this.resized) {
      this.app.renderer.resize(this.container.clientWidth, this.container.clientHeight);
      this.viewport.resize(this.container.clientWidth, this.container.clientHeight);

      this.resized = false;
    }

    this.app.renderer.render(this.app.stage);
  }
}

export default ViewportHandler;
