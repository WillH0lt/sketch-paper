import type { DrawSegment } from '@sketch-paper/core';
import { models } from './models.js';

export function compress(segments: DrawSegment[]): string {
  const stroke = models.Stroke.fromObject({ segments });

  const bytes = stroke.serializeBinary();

  return window.btoa(String.fromCharCode(...bytes));
}

export function decompress(data: string): DrawSegment[] {
  const bytes = new Uint8Array(
    window
      .atob(data)
      .split('')
      .map((c) => c.charCodeAt(0)),
  );

  const stroke = models.Stroke.deserializeBinary(bytes);

  return stroke.segments;
}
