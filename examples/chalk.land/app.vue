<template>
  <div class="absolute inset-0">
    <sketchy-draw-canvas
      ref="sketchyDrawCanvasRef"
      @sd-move="handleMove"
      @sd-draw="handleDraw"
    ></sketchy-draw-canvas>
    <div
      class="absolute bottom-1 left-2 pointer-events-none text-lg text-white"
      v-if="peopleHere > 0"
    >
      people here: {{ peopleHere }}
    </div>
    <div class="absolute bottom-1 right-2 pointer-events-none text-lg text-white">
      ({{ Math.round(x) }}, {{ Math.round(-1 * y) }})
    </div>
  </div>
</template>

<script setup lang="ts">
import '@sketchy-draw/core';
import type { SdDrawEvent, SdMoveEvent, SketchyDrawCanvas } from '@sketchy-draw/core';
import { io } from 'socket.io-client';

import { compress, decompress } from './utils';

const sketchyDrawCanvasRef = ref<InstanceType<typeof SketchyDrawCanvas>>();
const peopleHere = ref(0);
const x = ref(0);
const y = ref(0);

const socket = import.meta.client
  ? io('http://localhost:8087', {
      transports: ['websocket'],
    })
  : null;

function handleMove(event: SdMoveEvent) {
  x.value = event.detail.x;
  y.value = event.detail.y;
}

function handleDraw(event: SdDrawEvent) {
  socket?.emit('draw', compress(event.detail));
}

socket?.on('draw', (data: string) => {
  sketchyDrawCanvasRef.value?.draw(decompress(data));
});

socket?.on('join', (data: number) => {
  peopleHere.value = data;
});

socket?.on('leave', (data: number) => {
  peopleHere.value = data;
});

onUnmounted(() => {
  socket?.close();
});
</script>
