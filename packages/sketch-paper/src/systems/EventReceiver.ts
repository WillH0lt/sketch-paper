import { Emitter } from "strict-event-emitter";
import { system, co } from "@lastolivegames/becsy";

import { BaseSystem } from "./Base";
import * as sys from ".";
import * as comps from "../components";
import type { Events } from "../Emitter";
import { Brush } from "../types";

@system((s) => s.inAnyOrderWith(sys.InputReader))
export class EventReceiver extends BaseSystem {
  private readonly brushes = this.query(
    (q) => q.current.with(comps.Brush).write
  );

  private readonly emitter!: Emitter<Events>;

  initialize(): void {
    const handleUpdateBrushFn = (payload: Brush) => {
      this.handleUpdateBrushCoroutine(payload);
    };
    this.emitter.on("updateBrush", handleUpdateBrushFn);
    this.onDestroyCallbacks.push(() =>
      this.emitter.off("updateBrush", handleUpdateBrushFn)
    );
  }

  @co *handleUpdateBrushCoroutine(payload: Brush) {
    const brush = this.brushes.current[0].write(comps.Brush);
    brush.kind = payload.kind;
    brush.color = payload.color;
    brush.size = payload.size;

    yield;
  }
}
