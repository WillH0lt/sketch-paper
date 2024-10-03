export type SpZoomEvent = CustomEvent<{ zoom: number }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sp-zoom': SpZoomEvent;
  }
}
