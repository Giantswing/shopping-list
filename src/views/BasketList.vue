<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();

import BasketEntry from "./BasketEntry.vue";
</script>

<template>
  <div class="w-full flex flex-col items-center h-full" v-auto-animate>
    <div
      v-if="!useBasket.loading.basketProducts || useBasket.basketProducts?.length > 0"
      class="w-full flex flex-col-reverse gap-3 items-center p-3 pt-4"
      v-auto-animate="{ duration: 75 }"
    >
      <BasketEntry v-for="entry in useBasket.basketProducts" :key="entry.id" :entry="entry" />
    </div>

    <div
      v-else-if="useBasket.loading.basketProducts && useBasket.basketProducts?.length === 0"
      class="w-full flex flex-col items-center h-full justify-center"
    >
      <CIcon :icon="'line-md:loading-twotone-loop'" class="w-[100px] h-[100px] text-gray-500" />
    </div>
  </div>
</template>
