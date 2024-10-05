export enum BrushKinds {
  None = 1,
  Crayon = 2,
}

export interface DrawSegment {
  tileX: number;
  tileY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;
  kind: BrushKinds;
  size: number;
  runningLength: number;
}
