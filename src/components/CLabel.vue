<script>
export default {
  name: "MintyLabel",
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    info: {
      type: String,
      required: false,
      default: null,
    }
  },
};
</script>

<template>
  <p 
    class="relative block max-w-full md:mb-1 text-xs md:text-sm font-semibold text-gray-600 text-ellipsis whitespace-nowrap md:min-h-[20px]"
    :class="{ 'required-label': required, }"
  >
    <slot />
    <span 
      v-if="info" 
      class="text-sm hover:scale-110 transition-all duration-100 text-gray-500 inline-block ml-2 hover:text-blue-400 cursor-pointer"
      v-tippy="{ content: info, placement: 'right' }"
    >
      <MintyIcon :icon="'circle-info'" />
    </span>
  </p> 
</template>

<style>
input {
  @apply font-semibold;
}

.required-label::after {
  content: "🔴";
  position: absolute;
  color: red;
  transform: rotate(15deg);
  font-size: 0.4rem;
  top: -4px;
  margin-left: 2px;
  @apply animate-pulse;
}
</style>
