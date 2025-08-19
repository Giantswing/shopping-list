<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();

import ProductEntry from "./ProductEntry.vue";
</script>

<template>
  <div class="w-full flex flex-col-reverse gap-3 items-center p-3 pt-4" v-auto-animate>
    <ProductEntry v-for="entry in useBasket.basketProducts" :key="entry.id" :entry="entry" />
  </div>
</template>
