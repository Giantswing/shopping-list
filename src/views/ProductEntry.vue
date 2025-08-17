<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div
    class="flex flex-row gap-2 items-center bg-blue-100 w-full rounded-md py-3 px-3 justify-between text-sm font-semibold text-blue-900"
    @click.stop="useBasket.removeProductFromBasket(props.entry.product_id)"
  >
    <span>{{ useBasket.products.get(props.entry.product_id).name }}</span>
  </div>
</template>
