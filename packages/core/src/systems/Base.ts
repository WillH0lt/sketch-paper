import type { Entity } from '@lastolivegames/becsy';
import { System } from '@lastolivegames/becsy';

import * as comps from '../components/index.js';

// base class for all systems
class BaseSystem extends System {
  protected onDestroyCallbacks: (() => void)[] = [];

  // @ts-ignore
  private readonly _toBeDeleted = this.query((q) => q.with(comps.ToBeDeleted).write);

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

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected deleteEntity(entity: Entity): void {
    if (!entity.has(comps.ToBeDeleted)) {
      entity.add(comps.ToBeDeleted);
    }
  }
}

export default BaseSystem;
