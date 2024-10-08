# 🖍️ Sketch Paper

Sketch Paper is a library for creating drawing applications. It's the software behind [crayon.town](https://crayon.town).

## Usage

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  import { BrushKinds } from '@sketch-paper/core';

  const sketchPaperRef = ref();
  onMounted(() => {
    sketchPaperRef.value?.initialize({
      tileCountX: 0, // 0 means infinite
      tileCountY: 0, // 0 means infinite
      brushes: [BrushKinds.Crayon],
    });
  });
</script>

<template>
  <div style="width: 100vw; height: 100vh">
    <sketch-paper
      ref="sketchPaperRef"
      brush-color="#000000"
      :brush-kind="BrushKinds.Crayon"
      brush-size="20"
    >
    </sketch-paper>
  </div>
</template>
```

Check out the demo at [sketchpaper.ink](https://sketchpaper.ink).
