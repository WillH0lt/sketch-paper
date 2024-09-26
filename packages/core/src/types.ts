import type { EventMap } from 'strict-event-emitter';

export enum BrushKindEnum {
  Brush = 'Brush',
  Paint = 'Paint',
  Marker = 'Marker',
  Crayon = 'Crayon',
  Smudge = 'Smudge',
  Eraser = 'Eraser',
  Line = 'Line',
  Rectangle = 'Rectangle',
  Ellipse = 'Ellipse',
  Star = 'Star',
  FloodFill = 'FloodFill',
}

export interface Brush {
  kind: BrushKindEnum;
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
  assetsPath: string;
  baseColor: string;
}

export interface Events extends EventMap {
  updateBrush: [Brush];
  'draw-outgoing': [
    {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    },
  ];
  'draw-incoming': [
    {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    },
  ];
}
