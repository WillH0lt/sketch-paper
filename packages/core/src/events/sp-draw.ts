import type { DrawSegment } from '../types.js';

export type SpDrawEvent = CustomEvent<DrawSegment[]>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sp-draw': SpDrawEvent;
  }
}
