<template>
  <div class="absolute inset-0">
    <sketchy-draw-canvas
      @sd-move="handleMove"
      @sd-draw="handleDraw"
    ></sketchy-draw-canvas>
    <div
      class="absolute bottom-1 right-2 pointer-events-none text-lg text-white"
    >
      ({{ Math.round(x) }}, {{ Math.round(-1 * y) }})
    </div>
  </div>
</template>

<script setup lang="ts">
import "@sketchy-draw/core";
import type { SdDrawEvent, SdMoveEvent } from "@sketchy-draw/core";

const x = ref(0);
const y = ref(0);

function handleMove(event: SdMoveEvent) {
  x.value = event.detail.x;
  y.value = event.detail.y;
}

function handleDraw(event: SdDrawEvent) {
  console.log(event.detail);
}
</script>
