export type SdZoomEvent = CustomEvent<{ zoom: number }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'sd-zoom': SdZoomEvent;
  }
}
