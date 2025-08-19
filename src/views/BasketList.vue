<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();

import BasketEntry from "./BasketEntry.vue";
</script>

<template>
  <div
    class="w-full flex flex-col items-center h-full transition-all duration-75"
    :class="[!useBasket.loading.basketProducts && useBasket.basketProducts?.length === 0 ? 'translate-x-[-30px]' : '']"
  >
    <div
      v-if="useBasket.basketProducts?.length > 0 && !useBasket.loading.basketProducts"
      class="w-full flex flex-col-reverse gap-3 items-center p-3 pt-4"
      v-auto-animate="{ duration: 75 }"
    >
      <BasketEntry v-for="entry in useBasket.basketProducts" :key="entry.product_id" :entry="entry" />
    </div>

    <div v-else-if="useBasket.loading.basketProducts" class="w-full flex flex-col items-center h-full justify-center">
      <CIcon :icon="'line-md:loading-twotone-loop'" class="w-[100px] h-[100px] text-gray-500" />
    </div>

    <div
      v-else-if="!useBasket.loading.basketProducts && useBasket.basketProducts?.length === 0"
      class="w-full flex flex-col items-center h-full justify-center gap-4"
    >
      <CIcon :icon="'streamline-color:happy-face-flat'" class="w-[100px] h-[100px] text-gray-500" />
      <p class="text-gray-500 font-bold">{{ $t("no-products-in-basket") }}</p>
      <p class="text-gray-500 text-center">{{ $t("add-products-to-your-basket") }}</p>
    </div>
  </div>
</template>
