import * as PIXI from 'pixi.js';
import type BaseShader from './BaseShader.js';
import type { DrawSegment } from './types.js';
import { BrushKindEnum } from './types.js';

const SCALE = 1000;

abstract class BaseBrush {
  public static kind = BrushKindEnum.None;

  protected brush: PIXI.Mesh | null = null;

  protected app: PIXI.Application;

  public constructor(app: PIXI.Application) {
    this.app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/class-methods-use-this
  public onStrokeStart(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/class-methods-use-this
  public onStrokeEnd(): void {}

  protected initializeBrush(shader: BaseShader, options: Partial<PIXI.MeshOptions>): void {
    const geometry = new PIXI.Geometry({
      attributes: {
        aPosition: [0, 0, 1, 0, 1, 1, 0, 1],
        aUV: [0, 0, 1, 0, 1, 1, 0, 1],
      },
      indexBuffer: [0, 1, 2, 0, 2, 3],
    });

    const brush = new PIXI.Mesh({
      geometry,
      shader,
      ...options,
    });

    brush.scale.set(SCALE, SCALE);

    this.brush = brush as PIXI.Mesh;
  }

  public abstract init(): Promise<void>;

  public abstract draw(segment: DrawSegment, texture: PIXI.Texture): void;
}

export default BaseBrush;
