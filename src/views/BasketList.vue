<script setup>
import basket from "@/stores/basket";
const useBasket = basket();
</script>

<template>
  <div class="w-full flex flex-col-reverse gap-2 items-center ">
    <div v-for="product in useBasket.products">
      <span>{{ product.name }}</span>
    </div>
  </div>
</template>
