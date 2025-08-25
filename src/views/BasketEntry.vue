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
    class="flex flex-row gap-2 items-center bg-transparent w-full rounded-full justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 h-[42px] shrink-0 border-2 border-blue-900/20"
    :class="[
      useBasket.loading.removeProductFromBasketIds.includes(props.entry.id)
        ? 'opacity-50 saturate-0 cursor-not-allowed pointer-events-none'
        : ''
    ]"
  >
    <div class="flex justify-between items-center w-full h-full">
      <div
        class="flex justify-center items-center min-w-[56px] h-full bg-blue-300 gap-2 mr-[-14px] pr-2"
        @click.stop="useBasket.openEditQuantityModal(props.entry.id)"
      >
        <p class="text-center font-semibold text-sm text-blue-900">
          {{ useBasket.products.find(p => p.id === props.entry.id)?.quantity }}
        </p>
      </div>

      <div
        class="flex justify-center items-center w-full h-full gap-2 bg-blue-100 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.2)] z-10 px-1"
      >
        <p v-if="props.entry.offline" class="text-center font-semibold text-xs text-gray-600">Offline</p>
        <p class="text-center leading-none">{{ useBasket.products.find(p => p.id === props.entry.id)?.name }}</p>
      </div>

      <button class="bg-rose-400 px-4 h-full ml-[-14px] pl-5" @click.stop="useBasket.removeProductFromBasket(props.entry.id)">
        <CIcon :icon="'jam:delete-f'" class="w-[24px] h-[24px] text-gray-500 text-white" />
      </button>
    </div>
  </div>
</template>
