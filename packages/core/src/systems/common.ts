import type { Entity } from '@lastolivegames/becsy';
import { ToBeDeleted } from '../components/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function* waitForPromise(promise: Promise<any>): Generator {
  let completed = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/init-declarations
  let result: any;
  promise
    .then((res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result = res;
    })
    .catch((err: unknown) => {
      console.error(err);
    })
    .finally(() => {
      completed = true;
    });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (!completed) {
    yield;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}

export function deleteEntity(entity: Entity): void {
  if (!entity.has(ToBeDeleted)) {
    entity.add(ToBeDeleted);
  }
}

export function hexToRgba(hex: string): [number, number, number, number] {
  let bigint = parseInt(hex.slice(1), 16);

  if (hex.length === 7) {
    bigint = (bigint << 8) | 0xff;
  }

  return [(bigint >> 24) & 255, (bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function hexToNumber(hex: string): number {
  return parseInt(hex.slice(1), 16);
}

export function getTileImageUrl(baseUrl: string, tileX: number, tileY: number): string {
  return `${baseUrl}/${tileX}_${tileY}.png`;
}
