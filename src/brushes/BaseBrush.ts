import type { PixiPage } from "../PixiPage";
import { BrushKind } from "../enums";

export abstract class BaseBrush {
  abstract kind: BrushKind;
  abstract size: number;
  abstract color: [number, number, number, number];
  abstract draw(
    pointA: [number, number],
    pointB: [number, number],
    page: PixiPage
  ): void;
}
