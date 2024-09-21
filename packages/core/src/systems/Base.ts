import { System } from '@lastolivegames/becsy';

import * as comps from '../components/index.js';

// base class for all systems
class BaseSystem extends System {
  protected onDestroyCallbacks: (() => void)[] = [];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly _toBeDeleted = this.query((q) => q.with(comps.ToBeDeleted).write);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly _snapshots = this.query(
    (q) => q.with(comps.Snapshot).write.and.with(comps.Undoable).write,
  );

  public finalize(): void {
    this.onDestroyCallbacks.forEach((cb) => {
      cb();
    });
  }

  protected createSnapshot(): void {
    this.createEntity(comps.Snapshot, {}, comps.Undoable);
  }
}

export default BaseSystem;
