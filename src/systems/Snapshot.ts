import { system, Entity, ComponentType, co } from "@lastolivegames/becsy";
import * as jsondiffpatch from "jsondiffpatch";

import * as comps from "../components";
import { BaseSystem } from "./Base";

const jsonDiffPatchInstance = jsondiffpatch.create();

@system
export class Snapshot extends BaseSystem {
  private readonly input = this.singleton.read(comps.Input);

  private readonly snapshots = this.query((q) =>
    q.added.and.current.with(comps.Snapshot).write.orderBy((s) => -s.ordinal)
  );

  private readonly undoStack = this.query((q) =>
    q.current
      .with(comps.Snapshot)
      .with(comps.Undoable)
      .write.orderBy((s) => -s.ordinal)
  );

  private readonly redoStack = this.query((q) =>
    q.current
      .with(comps.Snapshot)
      .with(comps.Redoable)
      .write.orderBy((s) => s.ordinal)
  );

  private readonly pages = this.query((q) => q.current.with(comps.Page));

  private readonly all = this.query((q) => q.usingAll.write);

  initialize(): void {
    this.createSnapshot();
  }

  execute() {
    if (this.snapshots.added.length) {
      this.saveSnapshot(this.snapshots.added[0]);
      for (const redoable of this.redoStack.current) {
        redoable.add(comps.ToBeDeleted);
      }
    }

    // remove duplicate snapshots created by the same action
    if (this.snapshots.added.length > 1) {
      for (let i = 1; i < this.snapshots.added.length; i++) {
        this.snapshots.added[i].add(comps.ToBeDeleted);
      }
    }

    if (
      (this.input.yDownTrigger && this.input.modDown) ||
      (this.input.zDownTrigger && this.input.modDown && this.input.shiftDown)
    ) {
      // redo
      if (this.redoStack.current.length) {
        const nextSnapshot = this.redoStack.current[0];
        this.moveState(nextSnapshot);
        nextSnapshot.remove(comps.Redoable);
        nextSnapshot.add(comps.Undoable);
      }
    } else if (this.input.zDownTrigger && this.input.modDown) {
      // undo
      if (this.undoStack.current.length > 1) {
        const nextSnapshot = this.undoStack.current[1];
        this.moveState(nextSnapshot);
        this.undoStack.current[0].remove(comps.Undoable);
        this.undoStack.current[0].add(comps.Redoable);
      }
    }
  }

  private applyDiff(diff: any): Entity[] {
    const createdEntities: Entity[] = [];
    for (const label in diff) {
      const pageEntity = this.pages.current.find(
        (i) => i.read(comps.Page).label === label
      );

      if (!pageEntity) continue;

      if (Array.isArray(diff[label]) && diff[label].length === 2) {
        // only apply diff if page has changed (i.e. don't apply when page is added or removed)

        const page = pageEntity.write(comps.Page);
        page.image = diff[label][1];
      }
    }

    return createdEntities;
  }

  private emitChange(diff: any, state: any) {
    // const changes = {
    //   added: new Array<any>(),
    //   updated: new Array<any>(),
    //   removed: new Array<any>(),
    // };
    // for (const pageId in diff) {
    //   if (Array.isArray(diff[pageId]) && diff[pageId].length === 1) {
    //     // a new value was added, i.e. it was undefined and now has a value
    //     const page = state[pageId].element;
    //     changes.added.push(page);
    //   } else if (Array.isArray(diff[pageId]) && diff[pageId].length === 3) {
    //     // a value was deleted, i.e. it had a value and is now undefined
    //     // emitter.emit("snapshot:remove-elements", { id: pageId });
    //     const page = diff[pageId][0].element;
    //     changes.removed.push(page);
    //   } else {
    //     if (!diff[pageId].element) continue;
    //     const page = state[pageId].element;
    //     changes.updated.push(page);
    //   }
    // }
    // emitter.emit("snapshot:apply-changes", changes);
  }

  private serializeState(
    pageEntities = this.pages.current
  ): Record<string, any> {
    const state: Record<string, any> = {};
    for (const pageEntity of pageEntities) {
      const { label, image } = pageEntity.read(comps.Page);
      state[label] = image;
    }

    return state;
  }

  @co *saveSnapshot(snapshotEntity: Entity) {
    co.cancelIfCoroutineStarted();
    snapshotEntity = snapshotEntity.hold();

    const state = this.serializeState();

    const blob = new Blob([JSON.stringify(state)], {
      type: "application/json",
    });
    const blobUrl = URL.createObjectURL(blob);
    snapshotEntity.write(comps.Snapshot).url = blobUrl;

    if (this.undoStack.current.length <= 1) return;

    // ensure that the previous snapshot is not the same as the current one
    let prevSnapshot = this.undoStack.current.find(
      (s) => !s.isSame(snapshotEntity) && s.read(comps.Snapshot).url !== ""
    );

    if (!prevSnapshot) return;

    prevSnapshot = prevSnapshot.hold();
    const url = prevSnapshot.read(comps.Snapshot).url;
    const prevState = yield* this.waitForPromise(
      fetch(url).then((res) => res.json())
    );
    const diff = jsonDiffPatchInstance.diff(prevState, state);
    if (diff) {
      this.emitChange(diff, state);
    } else {
      prevSnapshot.add(comps.ToBeDeleted);
    }
  }

  @co *moveState(toSnapshotEntity: Entity) {
    const currState = this.serializeState();
    const { url } = toSnapshotEntity.read(comps.Snapshot);

    const nextState = yield* this.waitForPromise(
      fetch(url).then((res) => res.json())
    );

    const diff = jsonDiffPatchInstance.diff(currState, nextState);

    this.applyDiff(diff);
    // this.emitChange(diff, nextState);
  }
}
