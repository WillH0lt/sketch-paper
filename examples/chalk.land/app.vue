<template>
  <div class="absolute inset-0">
    <sketchy-draw-canvas
      ref="sketchyDrawCanvasRef"
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
import type {
  SdDrawEvent,
  SdMoveEvent,
  SketchyDrawCanvas,
} from "@sketchy-draw/core";
import { io } from "socket.io-client";

const sketchyDrawCanvasRef = ref<InstanceType<typeof SketchyDrawCanvas>>();
const x = ref(0);
const y = ref(0);

const socket = import.meta.client
  ? io("http://localhost:8086", {
      transports: ["websocket"],
    })
  : null;

function handleMove(event: SdMoveEvent) {
  x.value = event.detail.x;
  y.value = event.detail.y;
}

function handleDraw(event: SdDrawEvent) {
  const { startX, startY, endX, endY } = event.detail;
  socket?.emit("draw", [startX, startY, endX, endY]);
}

socket?.on("draw", (data: number[]) => {
  sketchyDrawCanvasRef.value?.draw(data[0], data[1], data[2], data[3]);
});
</script>
