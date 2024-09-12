import { Emitter } from "strict-event-emitter";
import { Brush } from "./types";

type Events = {
  "studio:update-brush": [Brush];
};

export const emitter: Emitter<Events> = new Emitter();
