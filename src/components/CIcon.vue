<script setup>
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  name: {
    type: String,
    default: 'home',
  },
  set: {
    type: String,
    default: 'mdi',
  },
  class: {
    type: [Array, String],
    default: '',
  },
});

const iconName = ref('');

onMounted(() => {
  if (props.name.includes(':')) {
    iconName.value = props.name;
  } else {
    iconName.value = `${props.set}:${props.name}`;
  }
});


</script>

<template>
  <Icon
    :icon="iconName"
    :class="props.class"
  />
</template>

