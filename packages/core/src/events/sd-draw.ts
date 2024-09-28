import type { DrawSegment } from '../types.js';

export type SdDrawEvent = CustomEvent<DrawSegment>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sd-draw': SdDrawEvent;
  }
}
