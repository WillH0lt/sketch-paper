// import { Emitter } from "strict-event-emitter";
import { Brush } from "./types";

export type Events = {
  updateBrush: [Brush];
  draw: [pointA: [number, number], pointB: [number, number]];
};

// export const emitter: Emitter<Events> = new Emitter();
