import type PixiTile from '../PixiTile.js';
import type { BrushKinds } from '../types.js';

abstract class BaseBrush {
  public abstract readonly kind: BrushKinds;

  public abstract size: number;

  public abstract color: [number, number, number, number];

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/class-methods-use-this
  public reset(): void {}

  public abstract draw(pointA: [number, number], pointB: [number, number], tile: PixiTile): void;
}

export default BaseBrush;
