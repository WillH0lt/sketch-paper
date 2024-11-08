# 🖍️ Sketch Paper

Sketch Paper is a web-component for creating drawing applications. It's the software behind [crayon.town](https://crayon.town).

Check out the live demo at [sketchpaper.ink](https://sketchpaper.ink) to see Sketch Paper in action.

## Installation

```bash
npm i @sketch-paper/core
```

## Usage

Sketch-paper is a web component, meaning you use it like this:

```js
// import the library
import '@sketch-paper/core';
```

```html
<!-- add it to your html -->
<sketch-paper ...></sketch-paper>
```

```js
// once <sketch-paper/> is mounted, you must initialize the component.
const sketchPaperElement = getElementsByTagName('sketch-paper')[0];
sketchPaperElement.initialize(settings);
```

## Simple Example

Sketch paper works with all frameworks. Here's an example showing it with Vue.js.

```html
<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  import { BrushKinds } from '@sketch-paper/core';

  const brush = ref({
    size: 10,
    color: '#000000',
    kind: BrushKinds.Marker,
  });

  const sketchPaperRef = ref();
  onMounted(() => {
    sketchPaperRef.value?.initialize({
      tileCountX: 0, // 0 means infinite
      tileCountY: 0, // 0 means infinite
      brushes: [BrushKinds.Marker],
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
```

Check out [/examples](https://github.com/WillH0lt/sketch-paper/tree/main/examples) for more.

## Settings

```js
// Settings are passed to the component via
sketchPaperElement.initialize(settings);
```

All settings are optional.

| field                  | Default             | Description                                                                                                                                                                                                                                      |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| brushes                | [BrushKinds.Crayon] | An array of brushes to load.                                                                                                                                                                                                                     |
| minZoom                | 0.25                | How far out the camera can zoom.                                                                                                                                                                                                                 |
| maxZoom                | 10                  | How far in the camera can zoom.                                                                                                                                                                                                                  |
| startX                 | 0                   | Camera starting position X.                                                                                                                                                                                                                      |
| startY                 | 0                   | Camera starting position Y.                                                                                                                                                                                                                      |
| tileCountX             | 1                   | Number of tiles in the x direction. 0 means infinite\* tiles                                                                                                                                                                                     |
| tileCountY             | 1                   | Number of tiles in the y direction. 0 means infinite\* tiles                                                                                                                                                                                     |
| tileWidth              | 2048                | The tile width in pixels.                                                                                                                                                                                                                        |
| tileHeight             | 2048                | The tile height in pixels.                                                                                                                                                                                                                       |
| baseUrl                | ''                  | Defines where Sketch Paper looks for tile images. Must be a public URL with the format`${baseUrl}/${tileX}_${tileY}.png` (tileX, tileY are the tile indices). Empty string means Sketch Paper will not try to load the tiles from remote images. |
| baseColor              | #C2BCB0             | Default color of the tiles.                                                                                                                                                                                                                      |
| backgroundColor        | #FFFFFF             | Color outside of the drawing surface.                                                                                                                                                                                                            |
| allowUndo              | true                | Boolean for undo/redo functionality. undo = ctrl+z, redo = ctrl+y or ctrl+shift+z                                                                                                                                                                |
| tileLoadingConcurrency | 3                   | How many tiles can be loading at once, useful when you're using "baseUrl".                                                                                                                                                                       |
| maxTiles               | 20                  | How many tiles can be loaded in memory at once.                                                                                                                                                                                                  |
| loadingImg             | ''                  | A URL pointing to an image to show while a tile is loading. The loading image doesn't have to be the same resolution as the tile.                                                                                                                |
| maxSegmentLength       | 0                   | How long a segment is a allowed to be. 0 means infinte.                                                                                                                                                                                          |
| isTransparent          | false               | Make the canvas itself transparent and only show brush strokes. Useful if you want to show html behind the sketch-paper element.                                                                                                                 |

\* Infinite actually means 2^32 pixels, the canvas will loop after that.

## Attributes

Add attributes directly to the HTML directive.

```html
<sketch-paper ... brush-color="#ff0000" brush-size="50"></sketch-paper>
```

`<sketch-paper>` uses the following attributes. Unlike the settings, these can be updated during runtime.
| Attribute | Default | Description |
| -------- | ------- | ------- |
| brush-color | #000000 | Hex string, it can also include opacity value, eg: #00000000
| brush-kind | BrushKinds.None | None, Crayon, Marker, Paint
| brush-size | 10 | The width and height in pixels of the brush tip
| action-left-mouse | PointerActions.Draw | None, Draw, Pan
| action-middle-mouse | PointerActions.Pan | None, Draw, Pan
| action-right-mouse | PointerActions.Pan | None, Draw, Pan
| action-wheel | WheelActions.Zoom | None, Zoom, Scroll

## Events

Stay informed by listening for events.

```html
<sketch-paper ... @sp-move="handleMove" />
```

```js
function handleMove(event: SpMoveEvent) {
    console.log(event.detail) // { x: 123; y: 456 }
}
```

The `<sketch-paper>` component emits the following events:

| Event        | Payload                  | Description                                                                                                          |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| sp-draw      | DrawSegment[]            | Emitted each frame when a new segment is drawn. The payload includes a draw segment for each tile that was drawn on. |
| sp-move      | { x: number; y: number } | Emitted when the camera is translated.                                                                               |
| sp-zoom      | { zoom: number }         | Emitted when the camera is zoomed.                                                                                   |
| sp-tile-load | index: [number, number]  | Emitted when a tile image is loaded.                                                                                 |
