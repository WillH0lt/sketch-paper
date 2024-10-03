export enum BrushKindEnum {
  None = 1,
  Crayon = 2,

  // Brush = 'Brush',
  // Paint = 'Paint',
  // Marker = 'Marker',
  // Crayon = 'Crayon',
  // Smudge = 'Smudge',
  // Eraser = 'Eraser',
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
  kind: BrushKindEnum;
  size: number;
}
