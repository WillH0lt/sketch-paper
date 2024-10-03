<template>
  <div class="flex relative [&>*]:flex-1 h-20 bg-white rounded-xl shadow-md pointer-events-auto">
    <div
      class="absolute bottom-12 left-0 right-0 h-72 bg-[#cfcfc6] rounded-t-xl shadow-md transition -z-10"
      :class="{
        'translate-y-[150%]': !colorPickerVisible,
        'translate-y-0': colorPickerVisible,
      }"
    >
      <div ref="colorPickerRef" class="w-full flex justify-center mt-10"></div>
    </div>

    <div
      class="rounded-full bg-black"
      :class="{
        'bg-white': brush.kind === BrushKindEnum.None,
      }"
      @click="brush.kind = BrushKindEnum.None"
    ></div>

    <div
      class="cursor-pointer data-[selected=true]:bg-[#00000033]"
      v-for="(color, index) in colors"
      @click="handleColorClick(index)"
      :style="{ backgroundColor: color }"
      data-selected="${this.brush.kind === tool.kind}"
    >
      <img
        class="hover:-translate-y-8 transition-transform"
        src="/crayon.png"
        data-selected="${this.brush.kind === tool.kind}"
      />
    </div>

    <div
      class="w-3/4 rounded-full"
      :style="{
        backgroundColor: brush.color,
        borderColor: brush.color,
      }"
      @click="colorPickerVisible = !colorPickerVisible"
    ></div>
  </div>
</template>

<script setup lang="ts">
import iro from '@jaames/iro';

import { BrushKindEnum } from '@sketch-paper/core';

const brush = defineModel<{
  color: string;
  kind: BrushKindEnum;
}>({ required: true });

const colors = ref<[string, string, string, string]>(['#FF0000', '#FF7F00', '#FFFF00', '#00FF00']);
const colorPickerVisible = ref(false);
const colorPickerRef = ref<HTMLElement>();
const selectedIndex = ref(0);

let picker: iro.ColorPicker | null = null;

function handleColorClick(index: number) {
  selectedIndex.value = index;
  picker?.color.set(colors.value[index]);
  brush.value.color = colors.value[index];
  brush.value.kind = BrushKindEnum.Crayon;
}

watch(
  colors,
  (colors) => {
    localStorage.setItem('colors', JSON.stringify(colors));
  },
  { deep: true },
);

onMounted(() => {
  if (!import.meta.client) return;

  const savedColors = JSON.parse(localStorage.getItem('colors') || '');
  if (Array.isArray(savedColors) && savedColors.length >= 4) {
    colors.value = savedColors.slice(0, 4) as [string, string, string, string];
  }

  brush.value.color = colors.value[selectedIndex.value];

  picker = iro.ColorPicker(colorPickerRef.value!, {
    width: 200,
    margin: 40,
    color: brush.value.color,
    layoutDirection: 'horizontal',
  });

  picker.on('color:change', (color: iro.Color) => {
    colors.value[selectedIndex.value] = color.hexString;
    brush.value.color = color.hexString;
  });
});
</script>
