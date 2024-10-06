<template>
  <div class="relative w-full pointer-events-auto">
    <div class="fixed inset-0" v-if="colorPickerVisible" @click="colorPickerVisible = false"></div>

    <div
      class="absolute bottom-12 left-0 right-0 h-72 bg-[#dbdbd5] rounded-t-2xl drop-shadow-lg transition cursor-auto"
      :class="{
        'translate-y-[150%]': !colorPickerVisible,
        'translate-y-0': colorPickerVisible,
      }"
    >
      <div ref="colorPickerRef" class="w-full flex justify-center mt-10"></div>
    </div>

    <div
      class="flex flex-1 pt-1 relative h-16 bg-white sm:rounded-t-2xl drop-shadow-2xl cursor-auto"
    >
      <div
        class="w-full cursor-pointer group"
        v-for="(_, index) in colors"
        @click="handleColorClick(index)"
      >
        <SvgCrayon
          class="w-6 mx-auto group-hover:-translate-y-8 transition-transform"
          :class="{
            '-translate-y-8': brush.kind === BrushKinds.Crayon && index === selectedIndex,
            'dark-wax': luminance(colors[index]) < 50,
            'bright-wax': luminance(colors[index]) > 175,
          }"
          :style="{
            fill: colors[index],
          }"
        />
      </div>

      <div class="flex items-center justify-center mr-2" @click="handlePointerClick">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-colors"
          :class="{
            'bg-primary': brush.kind === BrushKinds.None,
            'hover:bg-gray': brush.kind !== BrushKinds.None,
          }"
        >
          <SvgHand
            class="w-full h-full px-2 m-auto stroke-[#231f20] transition-colors"
            :class="{
              'stroke-[#004015]': brush.kind === BrushKinds.None,
            }"
          />
        </div>
      </div>

      <div class="flex items-center justify-center mx-1 mr-3">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-colors"
          :class="{
            'bg-[#acacac]': colorPickerVisible,
            'hover:bg-gray': !colorPickerVisible,
          }"
        >
          <div
            class="w-8 h-8 rounded-full cursor-pointer border-2 border-black"
            @click="handleColorPickerClick"
            :style="{
              backgroundColor: brush.color,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import iro from '@jaames/iro';

import { BrushKinds } from '@sketch-paper/core';
import SvgCrayon from '~/assets/svg/crayon.svg';
import SvgHand from '~/assets/svg/hand.svg';
import { luminance } from '../utils.js';

const brush = defineModel<{
  color: string;
  kind: BrushKinds;
}>({ required: true });

const colors = ref<[string, string, string, string]>(['#FF0000', '#FF7F00', '#429EFF', '#000000']);
const colorPickerVisible = ref(false);
const colorPickerRef = ref<HTMLElement>();
const selectedIndex = ref(0);

let picker: iro.ColorPicker | null = null;

function handleColorClick(index: number) {
  selectedIndex.value = index;
  picker?.color.set(colors.value[index]);
  brush.value.color = colors.value[index];
  brush.value.kind = BrushKinds.Crayon;
}

function handlePointerClick() {
  brush.value.kind = BrushKinds.None;
  colorPickerVisible.value = false;
}

function handleColorPickerClick() {
  colorPickerVisible.value = !colorPickerVisible.value;
  brush.value.kind = BrushKinds.Crayon;
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

  const savedColors = JSON.parse(localStorage.getItem('colors') || '[]');
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

<style>
.IroHandle {
  cursor: grab;
}
</style>
