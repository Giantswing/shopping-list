<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();

import ProductEntry from "./ProductEntry.vue";
</script>

<template>
  <div class="w-full flex flex-col-reverse gap-2 items-center p-1 pt-2" v-auto-animate>
    <ProductEntry v-for="entry in useBasket.basketProducts" :key="entry.id" :entry="entry" />
  </div>
</template>
