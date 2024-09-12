import { BrushKind } from "./enums";

export interface Brush {
  kind: BrushKind;
  color: string;
  size: number;
}

export interface Settings {
  tileCountX: number;
  tileCountY: number;
  tileWidth: number;
  tileHeight: number;
}
