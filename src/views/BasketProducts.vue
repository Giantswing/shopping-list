<script setup>
import { computed } from "vue";

import { basket } from "@/stores/basket";
const useBasket = basket();

import ProductEntry from "./ProductEntry.vue";

const products = computed(() => {
  return Array.from(useBasket.products.values()).sort((a, b) => b.name.localeCompare(a.name));
});
</script>

<template>
  <div class="w-full flex flex-col items-center h-full" v-auto-animate>
    <div class="w-full flex flex-col-reverse gap-3 items-center p-3 pt-4" v-auto-animate="{ duration: 75 }">
      <ProductEntry v-for="entry in products" :key="entry.id" :entry="entry" />
    </div>
  </div>
</template>
