export type SdDrawEvent = CustomEvent<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sd-draw': SdDrawEvent;
  }
}
