import * as PIXI from 'pixi.js';

import { CrayonBrush } from '@sketch-paper/brushes';
import type { DrawSegment } from '@sketch-paper/core';

class SketchPaper {
  private app: PIXI.Application | null = null;

  private sprite: PIXI.Sprite | null = null;

  private brush: CrayonBrush | null = null;

  public async init(
    element: HTMLElement,
    tilePositionX: number,
    tilePositionY: number,
  ): Promise<void> {
    this.app = new PIXI.Application();

    await this.app.init();

    this.app.canvas.classList.add('sketch-canvas');

    element.appendChild(this.app.canvas);

    const width = this.app.canvas.clientWidth;
    const height = this.app.canvas.clientHeight;

    this.app.renderer.resize(width, height);

    const texture = PIXI.RenderTexture.create({
      width,
      height,
    });

    this.sprite = new PIXI.Sprite(texture);
    this.sprite.position.set(tilePositionX, tilePositionY);

    const container = new PIXI.Container();
    container.position.set(-tilePositionX, -tilePositionY);
    container.addChild(this.sprite);

    this.app.stage.addChild(container);

    this.brush = new CrayonBrush(this.app);
    await this.brush.init();
  }

  public async loadImage(imgB64: string): Promise<void> {
    if (!this.sprite || !this.app) {
      return;
    }

    const texture: PIXI.Texture = await PIXI.Assets.load(imgB64);

    const container = new PIXI.Sprite(texture);

    this.app.renderer.render({
      container,
      target: this.sprite.texture,
      clear: true,
    });
  }

  public draw(segments: DrawSegment[]): void {
    if (!this.brush || !this.sprite) {
      return;
    }

    for (const segment of segments) {
      const startX = segment.startX;
      const startY = segment.startY;
      const endX = segment.endX;
      const endY = segment.endY;

      this.brush.draw([startX, startY], [endX, endY], this.sprite);
    }

    console.log('done');
  }
}

export default SketchPaper;
