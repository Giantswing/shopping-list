<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import basket from "@/stores/basket";
const useBasket = basket();

const router = useRouter();

onMounted(async () => {
  if (!useBasket.connectBasketData?.name || !useBasket.connectBasketData?.slug) {
    const route = useRoute();
    const slug = route.params.slug;
    await useBasket.checkIfBasketExists(slug);
  }
});

const connectToBasket = async () => {
  if (await useBasket.connectToBasket()) {
    router.push(`/basket/${useBasket.currentBasket}`);
  }
};
</script>

<template>
  <div class="w-full flex flex-col items-center h-screen px-2">
    <div class="w-full max-w-md p-6 bg-white rounded flex flex-col items-center gap-2">
      <h1 class="text-2xl font-bold">{{ useBasket.connectBasketData.name }}</h1>
      <input type="text" v-model="useBasket.connectBasketData.password" placeholder="Password" />
      <button @click="connectToBasket">Connect</button>
    </div>
  </div>
</template>
