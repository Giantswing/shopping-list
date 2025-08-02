<script setup>
const props = defineProps({
   addedClass: {
      type: [String, Array],
      default: () => "",
      required: false,
   },
});

</script>

<template>
   <div
      :class="[
         props.addedClass,
      ]"
   >
      <slot />
   </div>
</template>
