<template>
  <div class="relative w-full pointer-events-auto">
    <div class="fixed inset-0" v-if="colorPickerVisible" @click="colorPickerVisible = false"></div>

    <div
      class="absolute bottom-12 left-0 right-0 h-72 bg-[#cfcfc6] rounded-t-2xl drop-shadow-lg transition"
      :class="{
        'translate-y-[150%]': !colorPickerVisible,
        'translate-y-0': colorPickerVisible,
      }"
    >
      <div ref="colorPickerRef" class="w-full flex justify-center mt-10"></div>
    </div>

    <div class="flex flex-1 pt-0.5 relative h-16 bg-white rounded-t-xl drop-shadow-2xl">
      <div class="cursor-pointer" v-for="(color, index) in colors" @click="handleColorClick(index)">
        <img
          class="hover:-translate-y-8 -translate-y-2 transition-transform px-2"
          :class="{
            '-translate-y-8': brush.kind === BrushKindEnum.Crayon && index === selectedIndex,
          }"
          src="/crayon.png"
        />
      </div>

      <div class="flex items-center justify-center w-24" @click="handlePointerClick">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-colors"
          :class="{
            'bg-primary': brush.kind === BrushKindEnum.None,
            'hover:bg-gray': brush.kind !== BrushKindEnum.None,
          }"
        >
          <IconPointer
            class="text-3xl m-auto stroke-[#231f20] transition-colors"
            :class="{
              'stroke-[#004015]': brush.kind === BrushKindEnum.None,
            }"
          />
        </div>
      </div>

      <div class="flex items-center justify-center w-24">
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

import { BrushKindEnum } from '@sketch-paper/core';
import IconPointer from '~/assets/icons/pointer.svg';

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

function handlePointerClick() {
  brush.value.kind = BrushKindEnum.None;
  colorPickerVisible.value = false;
}

function handleColorPickerClick() {
  colorPickerVisible.value = !colorPickerVisible.value;
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
