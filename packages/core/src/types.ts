import type { DrawSegment } from '@sketch-paper/brushes';
import { BrushKindEnum } from '@sketch-paper/brushes';
import type { EventMap } from 'strict-event-emitter';

export { BrushKindEnum } from '@sketch-paper/brushes';
export type { DrawSegment } from '@sketch-paper/brushes';

export enum PointerActions {
  None = 'none',
  Pan = 'pan',
  Draw = 'draw',
}

export enum WheelActions {
  None = 'none',
  Zoom = 'zoom',
  Scroll = 'scroll',
}

export interface InputSettings {
  actionLeftMouse: PointerActions;
  actionMiddleMouse: PointerActions;
  actionRightMouse: PointerActions;
  actionWheel: WheelActions;
}

export interface Brush {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  kind: BrushKindEnum;
  size: number;
}

export interface Settings {
  minZoom: number;
  maxZoom: number;
  startX: number;
  startY: number;
  tileCountX: number;
  tileCountY: number;
  tileWidth: number;
  tileHeight: number;
  baseUrl: string;
  baseColor: string;
  backgroundColor: string;
  allowUndo: boolean;
  brushes: Exclude<BrushKindEnum, BrushKindEnum.None>[];
}

export const defaultSettings: Settings = {
  minZoom: 0.25,
  maxZoom: 10,
  startX: 0,
  startY: 0,
  tileCountX: 1,
  tileCountY: 1,
  tileWidth: 2048,
  tileHeight: 2048,
  baseUrl: '',
  baseColor: '#C2BCB0',
  backgroundColor: '#FFFFFF',
  allowUndo: true,
  brushes: [BrushKindEnum.Crayon],
};

export interface Tile {
  index: [number, number];
}

export interface Events extends EventMap {
  'update-brush': [Partial<Brush>];
  'update-input-settings': [InputSettings];
  'draw-outgoing': [DrawSegment[]];
  'draw-incoming': [DrawSegment[]];
  'tile-load': [Tile];
}
