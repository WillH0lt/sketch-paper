# Sketch Paper

Sketch Paper is a library for creating drawing applications. It's the software behind [crayon.town](https://crayon.town).

## Installation

```bash
npm i sketch-paper
```

## Usage

```html
<template>
  <sketch-paper
    class="w-92 h-92"
    ref="sketchPaperRef"
    :brush-color="brush.color"
    :brush-kind="brush.kind"
    :brush-size="15"
  ></sketch-paper>
</template>

<script setup>
  import { onMounted } from 'vue';

  import '@sketch-paper/core';

  const sketchPaperRef = ref();

  onMounted(() => {
    sketchPaperRef.value.initialize({
      minZoom: 1,
      maxZoom: 10,
      tileCountX: 0, // 0 means infinite
      tileCountY: 0, // 0 means infinite
      allowUndo: true,
    });
  });
</script>
```

Check out the demo at [sketchpaper.ink](https://sketchpaper.ink).
