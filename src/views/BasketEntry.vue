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
    class="flex flex-row gap-2 items-center bg-blue-100 w-full rounded-md justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 h-[48px] shrink-0"
    :class="[
      useBasket.loading.removeProductFromBasketIds.includes(props.entry.product_id)
        ? 'opacity-50 saturate-0 cursor-not-allowed pointer-events-none'
        : ''
    ]"
  >
    <div class="flex justify-between items-center w-full h-full">
      <div class="flex justify-center items-center w-full gap-2">
        <p v-if="props.entry.offline" class="text-center font-semibold text-xs text-gray-600">Offline</p>
        <p class="text-center">{{ useBasket.products.get(props.entry.product_id)?.name }}</p>
      </div>

      <button class="bg-red-400 px-4 h-full" @click.stop="useBasket.removeProductFromBasket(props.entry.product_id)">
        <CIcon :icon="'jam:delete-f'" class="w-[24px] h-[24px] text-gray-500 text-white" />
      </button>
    </div>
  </div>
</template>
