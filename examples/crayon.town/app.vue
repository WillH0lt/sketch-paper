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
      :action-left-mouse="actionLeftMouse"
    ></sketch-paper>

    <div class="absolute top-0 left-0 m-4 text-4xl pointer-events-none">
      <SvgCrayonLogo class="scale-150" />
    </div>

    <div
      class="absolute bottom-1 left-2 pointer-events-none text-2xl text-black hidden md:block"
      v-if="peopleHere > 0"
    >
      people here: {{ peopleHere }}
    </div>

    <div class="absolute flex w-full bottom-0 justify-center overflow-hidden pointer-events-none">
      <div class="flex items-end h-screen w-full max-w-[400px]">
        <palette v-model="brush"></palette>
      </div>
    </div>

    <div class="absolute bottom-1 right-1 pointer-events-none text-2xl text-black hidden md:block">
      <coordinates v-model="coords" @update="handleCoordinatesUpdate"></coordinates>
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
import { BrushKindEnum, PointerActions } from '@sketch-paper/core';
import throttle from 'lodash.throttle';
import { io } from 'socket.io-client';
import SvgCrayonLogo from '~/assets/svg/crayonLogo.svg';

import { imgUrl, wsUrl } from './config.js';
import { models } from './models.js';
import StrokeBuffer from './strokeBuffer.js';
import StrokeReplayer from './strokeReplayer.js';
import { getBoundedCoords } from './utils.js';

const router = useRouter();

const sketchPaperRef = ref<InstanceType<typeof SketchPaper>>();
const brush = ref({
  color: '#FF0000',
  kind: BrushKindEnum.None,
});
const peopleHere = ref(0);
const coords = ref({
  x: BigInt(0),
  y: BigInt(0),
});

console.log(import.meta.env);

// offsets to give the illusion of an infinite canvas, sketch-paper goes up to 2^32 pixels
// the offsets is the difference between the actual coordinates and the bounded coordinates
const coordsOffset = ref({
  x: BigInt(0),
  y: BigInt(0),
});

const actionLeftMouse = computed(() => {
  return brush.value.kind === BrushKindEnum.None ? PointerActions.Pan : PointerActions.Draw;
});

const path = router.currentRoute.value.path;
if (path.includes('@')) {
  try {
    const [startX, startY] = path.split('@')[1].split(',').map(BigInt);
    coords.value.x = startX;
    coords.value.y = startY;
  } catch {
    // parsing error
  }
}

const [startX, startY] = getBoundedCoords(coords.value.x, coords.value.y);
coordsOffset.value.x = coords.value.x - BigInt(startX);
coordsOffset.value.y = coords.value.y - BigInt(startY);

let interval: NodeJS.Timeout;
onMounted(async () => {
  interval = setInterval(() => {
    router.replace(`@${coords.value.x},${coords.value.y}`);
  }, 1000);

  await sketchPaperRef.value?.initialize({
    minZoom: 1,
    maxZoom: 10,
    startX,
    startY: -startY,
    tileCountX: 0, // 0 means infinite
    tileCountY: 0, // 0 means infinite
    baseUrl: imgUrl,
    allowUndo: false,
    maxTiles: 10,
    brushes: [BrushKindEnum.Crayon],
  });
});

const strokeBuffer = new StrokeBuffer(500);
const strokeReplayer = new StrokeReplayer(500);
const socket = import.meta.client
  ? io(wsUrl, {
      transports: ['websocket'],
    })
  : null;

strokeBuffer.onData((segments: DrawSegment[]) => {
  const stroke = models.Stroke.fromObject({ segments });
  const bytes = stroke.serializeBinary();

  // TODO send bytes directly to server instead of base64 encoding
  const data = window.btoa(String.fromCharCode(...bytes));
  socket?.emit('draw', data);
});

strokeReplayer.onData((segments: DrawSegment[]) => {
  sketchPaperRef.value?.draw(segments);
});

function handleSpMove(event: SpMoveEvent) {
  coords.value.x = coordsOffset.value.x + BigInt(event.detail.x);
  coords.value.y = coordsOffset.value.y + BigInt(-event.detail.y);
}

function handleSpDraw(event: SpDrawEvent) {
  strokeBuffer.add(event.detail);
}

function handleSpTileLoad(event: SpTileLoadEvent) {
  socket?.emit('tile-load', event.detail);
}

const handleCoordinatesUpdate = throttle(() => {
  const [x, y] = getBoundedCoords(coords.value.x, coords.value.y);
  sketchPaperRef.value?.move(x, -y);
}, 500);

socket?.on('draw', (data: string) => {
  const bytes = new Uint8Array(
    window
      .atob(data)
      .split('')
      .map((c) => c.charCodeAt(0)),
  );

  const stroke = models.Stroke.deserializeBinary(bytes);
  strokeReplayer.add(stroke.segments);
});

socket?.on('join', (data: number) => {
  peopleHere.value = data;
});

socket?.on('leave', (data: number) => {
  peopleHere.value = data;
});

onUnmounted(() => {
  socket?.close();
  clearInterval(interval);
  strokeBuffer.destroy();
  strokeReplayer.destroy();
});
</script>
