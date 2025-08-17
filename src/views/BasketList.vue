<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();
</script>

<template>
  <div class="w-full flex flex-col-reverse gap-2 items-center p-1 pt-2" v-auto-animate>
    <div
      v-for="entry in useBasket.basketProducts"
      :key="entry.id"
      class="flex flex-row gap-2 items-center bg-gray-100 w-full rounded-md p-2 px-3 justify-between text-sm"
      @click.stop="useBasket.removeProductFromBasket(entry.product_id)"
    >
      <span>{{ useBasket.products.get(entry.product_id).name }}</span> <span>{{ entry.quantity }}</span>
    </div>
  </div>
</template>
