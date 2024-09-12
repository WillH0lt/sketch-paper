import { system, co } from "@lastolivegames/becsy";

import { BaseSystem } from "./Base";
import * as sys from ".";
import * as comps from "../components";
import { emitter } from "../Emitter";
import { Brush } from "../types";

@system((s) => s.inAnyOrderWith(sys.InputReader))
export class EventReceiver extends BaseSystem {
  private readonly brushes = this.query(
    (q) => q.current.with(comps.Brush).write
  );

  initialize(): void {
    const handleUpdateBrushFn = (payload: Brush) => {
      this.handleUpdateBrushCoroutine(payload);
    };
    emitter.on("studio:update-brush", handleUpdateBrushFn);
    this.onDestroyCallbacks.push(() =>
      emitter.off("studio:update-brush", handleUpdateBrushFn)
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
