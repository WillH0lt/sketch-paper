import type { PixiTile } from "../PixiTile";
import { BrushKind } from "../enums";

export abstract class BaseBrush {
  abstract kind: BrushKind;
  abstract size: number;
  abstract color: [number, number, number, number];
  abstract draw(
    pointA: [number, number],
    pointB: [number, number],
    tile: PixiTile
  ): void;
  reset(): void {}
}
