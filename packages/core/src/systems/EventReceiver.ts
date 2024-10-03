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

  @co private *handleUpdateBrushCoroutine(payload: Partial<Brush>): Generator {
    const brush = this.brushes.current[0].write(comps.Brush);

    if ('kind' in payload && payload.kind !== undefined) brush.kind = payload.kind;
    if ('red' in payload && payload.red !== undefined) brush.red = payload.red;
    if ('green' in payload && payload.green !== undefined) brush.green = payload.green;
    if ('blue' in payload && payload.blue !== undefined) brush.blue = payload.blue;
    if ('alpha' in payload && payload.alpha !== undefined) brush.alpha = payload.alpha;
    if ('size' in payload && payload.size !== undefined) brush.size = payload.size;

    yield;
  }

  public initialize(): void {
    const handleUpdateBrushFn = (payload: Partial<Brush>): void => {
      this.handleUpdateBrushCoroutine(payload);
    };
    this.emitter.on('update-brush', handleUpdateBrushFn);
    this.onDestroyCallbacks.push(() => this.emitter.off('update-brush', handleUpdateBrushFn));
  }
}

export default EventReceiver;
