import pako from 'pako';

import type { DrawSegment } from '@sketchy-draw/core';

export function compress(segment: DrawSegment): string {
  const { tileX, tileY, startX, startY, endX, endY } = segment;
  const bytes = pako.deflate(
    new Uint8Array(new Int32Array([tileX, tileY, startX, startY, endX, endY]).buffer),
  );
  const data = window.btoa(String.fromCharCode(...bytes));

  console.log(data);
  return data;
}

export function decompress(compressed: string): DrawSegment {
  const bytes = new Uint8Array(Array.from(window.atob(compressed), (c) => c.charCodeAt(0)));
  const segment = new Int32Array(pako.inflate(bytes).buffer);
  return {
    tileX: segment[0],
    tileY: segment[1],
    startX: segment[2],
    startY: segment[3],
    endX: segment[4],
    endY: segment[5],
  };
}
