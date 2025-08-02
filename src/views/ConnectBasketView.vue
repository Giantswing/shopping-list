<script setup>
import basket from "@/stores/basket";
const useBasket = basket();

const route = useRoute();
const password = ref("");
</script>

<template>
  <div class="w-full flex flex-col items-center h-screen px-2"><h1 class="text-2xl font-bold">Connect Basket</h1></div>
</template>
