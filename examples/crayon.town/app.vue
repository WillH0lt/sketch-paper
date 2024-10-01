<template>
  <div class="absolute inset-0">
    <sketch-paper
      ref="sketchPaperRef"
      @sd-move="handleMove"
      @sd-draw="handleDraw"
      :min-zoom="0.25"
      :max-zoom="10"
      :tile-width="2048"
      :tile-height="2048"
      :tile-count-x="0"
      :tile-count-y="0"
      base-color="#C2BCB0"
      base-url="http://localhost:8086/v1/image"
      background-color="#FFFFFF"
    ></sketch-paper>
    <div
      class="absolute bottom-1 left-2 pointer-events-none text-2xl text-white"
      v-if="peopleHere > 0"
    >
      people here: {{ peopleHere }}
    </div>

    <div class="absolute flex w-full bottom-2 justify-center overflow-hidden pointer-events-none">
      <div class="flex items-end h-40 w-full max-w-[400px]">
        <palette class="w-full h-20 pointer-events-auto cursor-default"></palette>
      </div>
    </div>

    <div class="absolute bottom-1 right-2 pointer-events-none text-2xl text-white">
      ({{ Math.round(x) }}, {{ Math.round(-1 * y) }})
    </div>
  </div>
</template>

<script setup lang="ts">
import '@sketch-paper/core';
import type { SdDrawEvent, SdMoveEvent, SketchPaper } from '@sketch-paper/core';
import { io } from 'socket.io-client';

import { compress, decompress } from './utils';

const sketchPaperRef = ref<InstanceType<typeof SketchPaper>>();
const peopleHere = ref(0);
const x = ref(0);
const y = ref(0);

const socket = import.meta.client
  ? io('http://localhost:8087', {
      transports: ['websocket'],
      perMessageDeflate: {
        threshold: 0,
      },
    })
  : null;

function handleMove(event: SdMoveEvent) {
  x.value = event.detail.x;
  y.value = event.detail.y;
}

function handleDraw(event: SdDrawEvent) {
  socket?.emit('draw', compress(event.detail));
  socket?.emit('draw', event.detail);
}

socket?.on('draw', (data: string) => {
  sketchPaperRef.value?.draw(decompress(data));
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
