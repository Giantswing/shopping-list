<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import basket from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";

const route = useRoute();
const router = useRouter();

onMounted(() => {
  document.title = "Shopping List";
  let slug = route.params.slug;

  if (slug) {
    if (!useBasket.checkIfBasketExists(slug)) {
      router.push("/");
    }
  }
});
</script>

<template>
  <div class="w-full flex flex-col items-center h-screen px-2">
    <div class="flex-grow w-full overflow-y-auto"><BasketList /></div>
    <AddProductInput />
  </div>
</template>
