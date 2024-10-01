<template>
  <div class="flex [&>*]:flex-1 bg-white rounded-xl shadow-md">
    <div class="rounded-full bg-black"></div>

    <div
      class="cursor-pointer data-[selected=true]:bg-[#00000033]"
      v-for="color in colors"
      @click="handleClick(color)"
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
        backgroundColor: selectedColor,
        borderColor: selectedColor,
      }"
      @click="colorPickerVisible = !colorPickerVisible"
    ></div>
  </div>
  <div
    id="picker"
    class="pointer-events-auto"
    :class="{
      hidden: !colorPickerVisible,
    }"
  ></div>
</template>

<script setup lang="ts">
const colors = ref(['#FF0000', '#FF7F00', '#FFFF00', '#00FF00']);

const colorPickerVisible = ref(false);
const selectedColor = ref(colors.value[0]);

function handleClick(color: string) {
  selectedColor.value = color;
}

if (import.meta.client) {
  // const colorPicker = iro.ColorPicker('#picker', {
  //   // Set the size of the color picker
  //   width: 320,
  //   // Set the initial color to pure red
  //   color: '#f00',
  //   layoutDirection: 'horizontal',
  // });
}
</script>
