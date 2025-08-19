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
    class="flex flex-row gap-2 items-center bg-blue-100 w-full rounded-md justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden"
    :class="[
      useBasket.loading.removeProductFromBasketIds.includes(props.entry.product_id)
        ? 'opacity-50 saturate-0 cursor-not-allowed pointer-events-none'
        : ''
    ]"
  >
    <div class="flex justify-between w-full">
      <p class="px-4 py-3">{{ useBasket.products.get(props.entry.product_id).name }}</p>

      <button class="px-4 py-3 bg-red-400" @click.stop="useBasket.removeProductFromBasket(props.entry.product_id)">
        <CIcon :icon="'jam:delete-f'" class="w-[24px] h-[24px] text-gray-500 text-white" />
      </button>
    </div>
  </div>
</template>
