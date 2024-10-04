import type { DrawSegment } from '@sketch-paper/core';

class StrokeReplayer {
  private buffer: DrawSegment[] = [];

  private readonly listeners: ((data: DrawSegment[]) => void)[] = [];

  private readonly interval: NodeJS.Timeout | null = null;

  public constructor(intervalMillis: number) {
    if (!import.meta.client) return;

    this.interval = setInterval(() => {
      if (this.buffer.length === 0) return;

      const segments = this.buffer;
      this.buffer = [];

      const interval2 = setInterval(() => {
        const segment = segments.shift();
        if (!segment) {
          clearInterval(interval2);
          return;
        }

        for (const listener of this.listeners) {
          listener([segment]);
        }
      }, intervalMillis / segments.length);
    }, intervalMillis);
  }

  public add(segments: DrawSegment[]): void {
    this.buffer.push(...segments);
  }

  public onData(fn: (data: DrawSegment[]) => void): void {
    this.listeners.push(fn);
  }

  public destroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}

export default StrokeReplayer;
