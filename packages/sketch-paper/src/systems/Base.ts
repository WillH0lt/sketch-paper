import { System, Entity } from "@lastolivegames/becsy";

import * as comps from "../components";

// base class for all systems
export class BaseSystem extends System {
  // @ts-ignore
  private readonly _toBeDeleted = this.query(
    (q) => q.with(comps.ToBeDeleted).write
  );

  // @ts-ignore
  private readonly _snapshots = this.query(
    (q) => q.with(comps.Snapshot).write.and.with(comps.Undoable).write
  );

  onDestroyCallbacks: (() => void)[] = [];

  deleteEntity(entity: Entity) {
    if (!entity.has(comps.ToBeDeleted)) {
      entity.add(comps.ToBeDeleted);
    }
  }

  *waitForPromise(promise: Promise<any>) {
    let completed = false;
    let result: any;
    promise
      .then((res) => {
        result = res;
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        completed = true;
      });
    while (!completed) {
      yield;
    }

    return result;
  }

  createSnapshot() {
    this.createEntity(comps.Snapshot, {}, comps.Undoable);
  }

  finalize(): void {
    for (const cb of this.onDestroyCallbacks) {
      cb();
    }
  }
}
