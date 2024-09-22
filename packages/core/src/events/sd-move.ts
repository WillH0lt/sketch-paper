export type SdMoveEvent = CustomEvent<{ x: number; y: number }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sd-move': SdMoveEvent;
  }
}
