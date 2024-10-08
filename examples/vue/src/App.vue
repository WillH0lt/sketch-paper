<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { BrushKinds } from '@sketch-paper/core';
import type { SketchPaper } from '@sketch-paper/core';
import { Pane } from 'tweakpane';

const sketchPaperRef = ref<InstanceType<typeof SketchPaper>>();
const brush = ref({
  size: 10,
  color: '#000000',
  kind: BrushKinds.Marker,
});

const pane = new Pane();

pane.addBinding(brush.value, 'kind', {
  view: 'list',
  label: 'brush',
  options: [
    { text: 'Crayon', value: BrushKinds.Crayon },
    { text: 'Marker', value: BrushKinds.Marker },
    { text: 'Paint', value: BrushKinds.Paint },
  ],
});

pane.addBinding(brush.value, 'color');
pane.addBinding(brush.value, 'size', {
  min: 1,
  max: 100,
});

onMounted(() => {
  sketchPaperRef.value?.initialize({
    tileCountX: 0, // 0 means infinite
    tileCountY: 0, // 0 means infinite
    brushes: [BrushKinds.Crayon, BrushKinds.Marker, BrushKinds.Paint],
  });
});
</script>

<template>
  <sketch-paper
    ref="sketchPaperRef"
    style="width: 100vw; height: 100vh"
    :brush-color="brush.color"
    :brush-kind="brush.kind"
    :brush-size="brush.size"
  >
  </sketch-paper>
</template>
