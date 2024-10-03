export type SpMoveEvent = CustomEvent<{ x: number; y: number }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sp-move': SpMoveEvent;
  }
}
