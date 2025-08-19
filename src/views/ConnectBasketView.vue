<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

const router = useRouter();
const route = useRoute();

const checkBasketExists = async slug => {
  if (!useBasket.connectBasketData?.name || !useBasket.connectBasketData?.slug) {
    await useBasket.checkIfBasketExists(slug);
  }
};

onMounted(async () => {
  await checkBasketExists(route.params.slug);
});

// Watch for route parameter changes
watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      await checkBasketExists(newSlug);
    }
  }
);

const connectToBasket = async () => {
  if (await useBasket.connectToBasket()) {
    router.push(`/basket/${useBasket.currentBasket}`);
  }
};
</script>

<template>
  <div class="w-full max-w-md p-6 bg-white rounded flex flex-col items-center gap-2">
    <button
      class="text-sm text-gray-500 mt-2 border-2 border-gray-400 rounded-full px-4 py-1 flex items-center gap-2 mb-6"
      @click="router.push('/')"
    >
      <CIcon :icon="'line-md:arrow-left'" />
      {{ $t("go-back") }}
    </button>

    <h1 class="text-2xl font-bold">{{ useBasket.connectBasketData.name }}</h1>
    <form class="w-full flex flex-col items-center gap-2" @submit.prevent="connectToBasket">
      <input
        autofocus
        type="password"
        v-model="useBasket.connectBasketData.password"
        :placeholder="$t('password')"
        class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center mb-6"
      />
      <CButton :buttonType="'secondary'" @click="connectToBasket">{{ $t("connect") }}</CButton>
    </form>
  </div>
</template>
