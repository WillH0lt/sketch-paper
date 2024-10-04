import type { DrawSegment } from '@sketch-paper/core';

function distanceSq(s1: DrawSegment, s2: DrawSegment): number {
  return (s1.endX - s2.startX) ** 2 + (s1.endY - s2.startY) ** 2;
}

function removeRedundant(segments: DrawSegment[]): void {
  if (segments.length < 2) return;

  for (let i = 0; i < segments.length - 1; i++) {
    const curr = segments[i];
    const next = segments[i + 1];

    if (distanceSq(curr, next) <= 2) {
      // segments are connected
      const angleCurr = Math.atan2(curr.endY - curr.startY, curr.endX - curr.startX);
      const angleNext = Math.atan2(next.endY - next.startY, next.endX - next.startX);

      const diff = Math.abs(angleCurr - angleNext);

      if (diff < 0.1) {
        // segments form a nearly straight line

        curr.endX = next.endX;
        curr.endY = next.endY;

        segments.splice(i + 1, 1);
        i--;
      }
    }
  }
}

class StrokeBuffer {
  private buffer: DrawSegment[] = [];

  private readonly listeners: ((segments: DrawSegment[]) => void)[] = [];

  private readonly interval: NodeJS.Timeout | null = null;

  public constructor(intervalMillis: number) {
    if (!import.meta.client) return;

    this.interval = setInterval(() => {
      if (this.buffer.length === 0) return;

      removeRedundant(this.buffer);
      const segments = this.buffer;
      this.buffer = [];

      for (const listener of this.listeners) {
        listener(segments);
      }
    }, intervalMillis);
  }

  public add(segments: DrawSegment[]): void {
    this.buffer.push(...segments);
  }

  public onData(fn: (segments: DrawSegment[]) => void): void {
    this.listeners.push(fn);
  }

  public destroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}

export default StrokeBuffer;
