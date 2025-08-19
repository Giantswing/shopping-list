<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";
import BurguerMenu from "@/views/BurguerMenu.vue";

const route = useRoute();
const router = useRouter();

const connectToBasket = async slug => {
  if (slug) {
    if (!(await useBasket.checkIfBasketExists(slug))) {
      router.push("/");
      return;
    }

    const basketCredentials = useBasket.getBasketCredentials(slug);
    /* If we don't have credentials */
    if (!basketCredentials) {
      router.push(`/connect-basket/${slug}`);
      return;
    } else {
      useBasket.connectBasketData.password = basketCredentials.password;

      /* Invalid credentials, password has changed */
      if (!(await useBasket.connectToBasket())) {
        router.push(`/connect-basket/${slug}`);
        return;
      }
    }

    /* If we reach this point, we have valid credentials */
    useBasket.startRefreshItemsInterval();
    useBasket.getBasketProducts();
  }
};

onMounted(async () => {
  await connectToBasket(route.params.slug);
  document.title = "🧺 " + useBasket.currentBasket;
});

// Watch for route parameter changes
watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      // Stop the current refresh interval before switching
      useBasket.stopRefreshItemsInterval();
      await connectToBasket(newSlug);
    }
  }
);

onBeforeUnmount(() => {
  useBasket.stopRefreshItemsInterval();
});
</script>

<template>
  <!-- Alternative approach: You could also use :key="route.params.slug" to force component re-mounting -->
  <div class="flex flex-col w-full h-full relative">
    <BurguerMenu />
    <div class="flex-grow w-full overflow-y-auto overflow-x-hidden"><BasketList /></div>
    <AddProductInput />
  </div>
</template>
