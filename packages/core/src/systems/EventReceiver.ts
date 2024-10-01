import { co, system } from '@lastolivegames/becsy';
import type { Emitter } from 'strict-event-emitter';

import * as comps from '../components/index.js';
import type { Brush, Events } from '../types.js';
import BaseSystem from './Base.js';
import InputReader from './InputReader.js';

@system((s) => s.inAnyOrderWith(InputReader))
class EventReceiver extends BaseSystem {
  private readonly brushes = this.query((q) => q.current.with(comps.Brush).write);

  private readonly emitter!: Emitter<Events>;

  @co private *handleUpdateBrushCoroutine(payload: Brush): Generator {
    const brush = this.brushes.current[0].write(comps.Brush);
    brush.kind = payload.kind;
    brush.color = payload.color;
    brush.size = payload.size;

    yield;
  }

  public initialize(): void {
    const handleUpdateBrushFn = (payload: Brush): void => {
      this.handleUpdateBrushCoroutine(payload);
    };
    this.emitter.on('update-brush', handleUpdateBrushFn);
    this.onDestroyCallbacks.push(() => this.emitter.off('update-brush', handleUpdateBrushFn));
  }
}

export default EventReceiver;
