<script setup>
import { onMounted } from "vue";
import shop from "@/stores/shop";
const useShop = shop();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";

onMounted(() => {
  document.title = "Shopping List";
  useShop.ping();
});
</script>

<template>
  <div class="w-full flex flex-col items-center px-4 max-h-screen overflow-y-auto relative">
    <BasketList />
    <AddProductInput />
  </div>
</template>
