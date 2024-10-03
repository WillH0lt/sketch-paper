<template>
  <div class="absolute inset-0">
    <sketch-paper
      ref="sketchPaperRef"
      @sp-move="handleSpMove"
      @sp-draw="handleSpDraw"
      @sp-tile-load="handleSpTileLoad"
      :brush-color="brush.color"
      :brush-kind="brush.kind"
      :brush-size="15"
      :interaction-mode="interactionMode"
    ></sketch-paper>

    <div class="absolute top-0 left-0 m-2 text-4xl pointer-events-none">🖍️</div>

    <div
      class="absolute bottom-1 left-2 pointer-events-none text-2xl text-white hidden md:block"
      v-if="peopleHere > 0"
    >
      people here: {{ peopleHere }}
    </div>

    <div
      class="absolute flex w-full bottom-2 justify-center overflow-hidden pointer-events-none z-10"
    >
      <div class="flex items-end h-screen w-full max-w-[400px]">
        <palette v-model="brush"></palette>
      </div>
    </div>

    <div class="absolute bottom-1 right-1 pointer-events-none text-2xl text-white hidden md:block">
      <coordinates v-model="coords"></coordinates>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@sketch-paper/core';
import type {
  DrawSegment,
  SketchPaper,
  SpDrawEvent,
  SpMoveEvent,
  SpTileLoadEvent,
} from '@sketch-paper/core';
import { BrushKindEnum, InteractionModeEnum } from '@sketch-paper/core';
import { io } from 'socket.io-client';

const router = useRouter();

const sketchPaperRef = ref<InstanceType<typeof SketchPaper>>();
const brush = ref({
  color: '#FF0000',
  kind: BrushKindEnum.None,
});
const peopleHere = ref(0);
const coords = ref({
  x: 0,
  y: 0,
});

const interactionMode = computed(() => {
  return brush.value.kind === BrushKindEnum.None
    ? InteractionModeEnum.Pan
    : InteractionModeEnum.Draw;
});

const path = router.currentRoute.value.path;
if (path.includes('@')) {
  const [startX, startY] = path.split('@')[1].split(',').map(Number);
  if (!isNaN(startX) && !isNaN(startY)) {
    coords.value.x = startX;
    coords.value.y = startY;
  }
}

let interval: NodeJS.Timeout;
onMounted(async () => {
  interval = setInterval(() => {
    router.replace(`@${Math.round(coords.value.x)},${Math.round(coords.value.y)}`);
  }, 1000);

  await sketchPaperRef.value?.initialize({
    minZoom: 1,
    maxZoom: 10,
    startX: coords.value.x,
    startY: -coords.value.y,
    tileWidth: 2048,
    tileHeight: 2048,
    tileCountX: 0, // 0 means infinite
    tileCountY: 0, // 0 means infinite
    baseUrl: 'https://storage.googleapis.com/sketch-paper-public',
    baseColor: '#C2BCB0',
    backgroundColor: '#FFFFFF',
    allowUndo: false,
    brushes: [BrushKindEnum.Crayon],
  });
});

onUnmounted(() => {
  socket?.close();
  clearInterval(interval);
});

const socket = import.meta.client
  ? io('http://localhost:8087', {
      transports: ['websocket'],
    })
  : null;

function handleSpMove(event: SpMoveEvent) {
  coords.value.x = event.detail.x;
  coords.value.y = -event.detail.y;
}

function handleSpDraw(event: SpDrawEvent) {
  socket?.emit('draw', event.detail);
}

function handleSpTileLoad(event: SpTileLoadEvent) {
  socket?.emit('tile-load', event.detail);
}

watchEffect(() => {
  sketchPaperRef.value?.move(coords.value.x, -coords.value.y);
});

socket?.on('draw', (segments: DrawSegment[]) => {
  sketchPaperRef.value?.draw(segments);
});

socket?.on('join', (data: number) => {
  peopleHere.value = data;
});

socket?.on('leave', (data: number) => {
  peopleHere.value = data;
});
</script>
