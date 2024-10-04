<template>
  <input
    class="bg-transparent w-fit border-none pointer-events-auto text-right min-w-32 p-1"
    style="field-sizing: content"
    type="text"
    v-model="text"
    @blur="blurred = true"
    @focus="blurred = false"
    @input="onInput"
    @keydown.enter="onEnter"
    @keydown.stop
  />
</template>

<script setup lang="ts">
const coords = defineModel<{
  x: bigint;
  y: bigint;
}>({ required: true });

const emit = defineEmits<{
  (event: 'update', coords: { x: bigint; y: bigint }): void;
}>();

const blurred = ref(true);
const text = ref('');

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const c = target.value;
  const match = c.match(/\(?(-?\d+), ?(-?\d+)\)?/);

  if (match) {
    coords.value.x = BigInt(match[1]);
    coords.value.y = BigInt(match[2]);
    emit('update', coords.value);
  }
}

function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  target.blur();
}

watchEffect(() => {
  if (blurred.value) {
    text.value = `(${coords.value.x}, ${coords.value.y})`;
  }
});
</script>
