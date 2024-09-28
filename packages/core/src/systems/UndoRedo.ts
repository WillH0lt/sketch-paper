import type { Entity } from '@lastolivegames/becsy';
import { co, system } from '@lastolivegames/becsy';
import * as jsondiffpatch from 'jsondiffpatch';

import * as comps from '../components/index.js';
import BaseSystem from './Base.js';
import { getTileImageUrl, waitForPromise } from './common.js';

const jsonDiffPatchInstance = jsondiffpatch.create();

type stateSnapshot = Record<string, string>;

@system
class UndoRedo extends BaseSystem {
  private readonly input = this.singleton.read(comps.Input);

  private readonly snapshots = this.query((q) =>
    q.added.and.current.with(comps.Snapshot).write.orderBy((s) => -s.ordinal),
  );

  private readonly settings = this.singleton.read(comps.Settings);

  private readonly undoStack = this.query((q) =>
    q.current
      .with(comps.Snapshot)
      .with(comps.Undoable)
      .write.orderBy((s) => -s.ordinal),
  );

  private readonly redoStack = this.query((q) =>
    q.current
      .with(comps.Snapshot)
      .with(comps.Redoable)
      .write.orderBy((s) => s.ordinal),
  );

  private readonly tileSources = this.query((q) => q.current.with(comps.TileSource));

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly _all = this.query((q) => q.usingAll.write);

  @co private *saveSnapshot(snapshotEntity: Entity): Generator {
    co.cancelIfCoroutineStarted();
    // const napshotEntity = snapshotEntity.hold();

    const state = this.serializeState();

    const blob = new Blob([JSON.stringify(state)], {
      type: 'application/json',
    });
    const blobUrl = URL.createObjectURL(blob);
    const snapshot = snapshotEntity.write(comps.Snapshot);
    snapshot.url = blobUrl;

    if (this.undoStack.current.length <= 1) return;

    // ensure that the previous snapshot is not the same as the current one
    let prevSnapshot = this.undoStack.current.find(
      (s) => !s.isSame(snapshotEntity) && s.read(comps.Snapshot).url !== '',
    );

    if (!prevSnapshot) return;

    prevSnapshot = prevSnapshot.hold();
    const url = prevSnapshot.read(comps.Snapshot).url;
    const prevState = (yield* waitForPromise(
      fetch(url).then(async (res) => res.json()),
    )) as stateSnapshot;
    const diff = jsonDiffPatchInstance.diff(prevState, state);
    if (diff) {
      // this.emitChange(diff, state);
    } else {
      prevSnapshot.add(comps.ToBeDeleted);
    }
  }

  @co private *moveState(toSnapshotEntity: Entity): Generator {
    const currState = this.serializeState();
    const { url } = toSnapshotEntity.read(comps.Snapshot);

    const nextState = (yield* waitForPromise(
      fetch(url).then(async (res) => res.json()),
    )) as stateSnapshot;

    const diff = jsonDiffPatchInstance.diff(currState, nextState);

    this.applyDiff(diff);

    // this.emitChange(diff, nextState);
  }

  public initialize(): void {
    this.createSnapshot();
  }

  public execute(): void {
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

  private applyDiff(diff: jsondiffpatch.Delta): Entity[] {
    const createdEntities: Entity[] = [];

    // eslint-disable-next-line guard-for-in
    for (const label in diff) {
      const tileSourceEntity = this.tileSources.current.find(
        (i) => i.read(comps.TileSource).label === label,
      );

      if (!tileSourceEntity) continue;
      if (!Array.isArray(diff[label as keyof jsondiffpatch.Delta])) continue;

      const diffField = diff[label as keyof jsondiffpatch.Delta] as string[];

      if (diffField.length === 2) {
        // only apply diff if tile has changed (i.e. don't apply when tile is added or removed)
        const tileSource = tileSourceEntity.write(comps.TileSource);
        tileSource.image = diffField[1];
      } else if (diffField.length === 3) {
        // a value was deleted, i.e. it had a value and is now undefined
        const image = diffField[0];
        if (!image.includes(this.settings.baseUrl)) {
          const tileSource = tileSourceEntity.write(comps.TileSource);
          const tile = tileSource.tiles[0].read(comps.Tile);
          const x = tile.position[0] / this.settings.tileWidth;
          const y = tile.position[1] / this.settings.tileHeight;
          tileSource.image = getTileImageUrl(this.settings.baseUrl, x, y);
        }
      }
    }

    return createdEntities;
  }

  // private emitChange(diff: any, state: any) {
  // const changes = {
  //   added: new Array<any>(),
  //   updated: new Array<any>(),
  //   removed: new Array<any>(),
  // };
  // for (const tileId in diff) {
  //   if (Array.isArray(diff[tileId]) && diff[tileId].length === 1) {
  //     // a new value was added, i.e. it was undefined and now has a value
  //     const tile = state[tileId].element;
  //     changes.added.push(tile);
  //   } else if (Array.isArray(diff[tileId]) && diff[tileId].length === 3) {
  //     // a value was deleted, i.e. it had a value and is now undefined
  //     // emitter.emit("snapshot:remove-elements", { id: tileId });
  //     const tile = diff[tileId][0].element;
  //     changes.removed.push(tile);
  //   } else {
  //     if (!diff[tileId].element) continue;
  //     const tile = state[tileId].element;
  //     changes.updated.push(tile);
  //   }
  // }
  // emitter.emit("snapshot:apply-changes", changes);
  // }

  private serializeState(tileSourceEntities = this.tileSources.current): stateSnapshot {
    const state: stateSnapshot = {};
    for (const tileSourceEntity of tileSourceEntities) {
      const { label, image } = tileSourceEntity.read(comps.TileSource);
      state[label] = image;
    }

    return state;
  }
}

export default UndoRedo;
