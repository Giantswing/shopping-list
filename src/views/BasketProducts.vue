<script setup>
import { computed } from "vue";

import { basket } from "@/stores/basket";
const useBasket = basket();

import ProductEntry from "./ProductEntry.vue";

const products = computed(() => {
  let results = useBasket.products.values();
  results = Array.from(results).sort((a, b) => a.name.localeCompare(b.name));

  return results;
});

const notAddedProducts = computed(() => {
  return products.value.filter(
    product => !useBasket.basketProducts.some(basketProduct => basketProduct.product_id === product.id)
  );
});

const addedProducts = computed(() => {
  return products.value.filter(product =>
    useBasket.basketProducts.some(basketProduct => basketProduct.product_id === product.id)
  );
});
</script>

<template>
  <div class="w-full flex flex-col items-center h-full" v-auto-animate>
    <div class="w-full grid grid-cols-2 gap-3 items-center p-3 pt-4" v-auto-animate="{ duration: 150 }">
      <ProductEntry v-for="entry in addedProducts" :key="entry.id" :entry="entry" />

      <div class="w-[80%] h-[2px] bg-gray-300 mx-auto my-1 col-span-2 rounded-full"></div>
      <ProductEntry v-for="entry in notAddedProducts" :key="entry.id" :entry="entry" />
    </div>
  </div>
</template>
