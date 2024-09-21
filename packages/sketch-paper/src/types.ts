import { BrushKind } from "./enums";

export interface Brush {
  kind: BrushKind;
  color: string;
  size: number;
}

export interface Settings {
  minZoom: number;
  maxZoom: number;
  // tileCountX: number;
  // tileCountY: number;
  tileWidth: number;
  tileHeight: number;
}
