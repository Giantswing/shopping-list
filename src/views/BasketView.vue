<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";

import basket from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";

const route = useRoute();

onMounted(() => {
  document.title = "Shopping List";
  useBasket.currentBasket = route.params.slug;

  useBasket.ping();
});
</script>

<template>
  <div class="w-full flex flex-col items-center h-screen px-2">
    <div class="flex-grow w-full overflow-y-auto"><BasketList /></div>
    <AddProductInput />
  </div>
</template>
