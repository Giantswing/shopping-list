<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: [Boolean, Number],
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
  inClass: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="flex gap-2">
    <input
      type="checkbox"
      :checked="modelValue"
      @input="$emit('update:modelValue', $event.target.checked)" 

      :class="[
        'hover:scale-110 active:scale-90 duration-200 transition-all border-2 border-blue-active form-checkbox h-[38px] w-[38px] text-red-500 rounded-xl disabled:opacity-90 disabled:cursor-not-allowed disabled:border-gray-500 disabled:saturate-0 disabled:brightness-200 accent-blue-active',
        props.inClass,

      ]"

    />

    <p
      v-if="label && label.length > 0"
      class="font-semibold text-gray-600 text-sm max-h-[38px] leading-none flex items-center custom-break py-[1px]"
      v-tippy="{ content: label, placement: 'top' }"
    >
      {{ label }}
    </p>
  </div>

</template>
<style scoped>
.custom-break {
  display: -webkit-box;
  max-width: 400px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  @apply my-auto;
}
</style>
