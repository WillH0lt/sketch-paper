import type { Tile } from '../types.js';

export type SpTileLoadEvent = CustomEvent<Tile>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sp-tile-load': SpTileLoadEvent;
  }
}
