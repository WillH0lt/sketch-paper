# 🖍️ Sketch Paper

Sketch Paper is a library for creating drawing applications. It's the software behind [crayon.town](https://crayon.town).

## Installation

```bash
npm i sketch-paper
```

## Usage

```html
<template>
  <sketch-paper
    id="sketch-paper"
    width="100vw"
    height="100vh"
    brush-color="#FF0000"
    brush-size="15"
    :brush-kind="BrushKinds.Marker"
  ></sketch-paper>
</template>

<script setup>
  import { onMounted } from 'vue';

  import { BrushKinds } '@sketch-paper/core';

  onMounted(() => {
    const sketchPaper = document.getElementById('sketch-paper');

    sketchPaper.initialize({
      minZoom: 1,
      maxZoom: 10,
      startX: 0,
      startY: 0,
      tileCountX: 0, // 0 means infinite
      tileCountY: 0, // 0 means infinite
      allowUndo: true,
      brushes: [BrushKinds.Crayon, BrushKinds.Marker, BrushKinds.Paint],
    });
  });
</script>
```

Check out the demo at [sketchpaper.ink](https://sketchpaper.ink).
