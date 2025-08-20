<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";
import BasketProducts from "@/views/BasketProducts.vue";
import BurguerMenu from "@/views/BurguerMenu.vue";

const route = useRoute();
const router = useRouter();

const connectToBasket = async slug => {
  if (slug) {
    if (!(await useBasket.checkIfBasketExists(slug))) {
      router.push("/");
      return;
    }

    let earlyLoginSuccess = false;
    const urlPass = route.query.pass;

    if (urlPass) {
      useBasket.connectBasketData.password = urlPass;
      useBasket.connectBasketData.slug = slug;

      /* Invalid credentials, password has changed */
      earlyLoginSuccess = await useBasket.connectToBasket();
      if (!earlyLoginSuccess) {
        router.push(`/connect-basket/${slug}`);
        return;
      }
    }

    if (!earlyLoginSuccess) {
      const basketCredentials = useBasket.getBasketCredentials(slug);

      /* If we don't have credentials */
      if (!basketCredentials) {
        router.push(`/connect-basket/${slug}`);
        return;
      } else {
        useBasket.connectBasketData.slug = slug;
        useBasket.connectBasketData.password = basketCredentials.password;

        /* Invalid credentials, password has changed */
        if (!(await useBasket.connectToBasket())) {
          router.push(`/connect-basket/${slug}`);
          return;
        }
      }
    }

    /* If we reach this point, we have valid credentials */
    useBasket.startRefreshItemsInterval();
    useBasket.getBasketProducts();
  }
};

onMounted(async () => {
  document.title = "Loading...";
  await connectToBasket(route.params.slug);
  document.title = useBasket.connectedBaskets?.find(basket => basket.slug === useBasket.currentBasket)?.name;
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
  <div class="flex flex-col w-full h-full relative" v-auto-animate="{ duration: 75 }">
    <h3 class="font-bold text-right text-blue-700 px-4 opacity-30 select-none mb-[-15px] z-50 pointer-events-none">
      {{ useBasket?.connectedBaskets?.find(basket => basket.slug === useBasket.currentBasket)?.name }}
    </h3>
    <BurguerMenu />
    <div
      v-if="useBasket.currentView === 'list'"
      class="flex-grow w-full overflow-y-auto overflow-x-hidden pl-[70px]"
      :class="[useBasket.burguerMenuOpen ? 'pointer-events-none' : '']"
    >
      <BasketList />
    </div>
    <div
      v-else
      class="flex-grow w-full overflow-y-auto overflow-x-hidden pl-[70px]"
      :class="[useBasket.burguerMenuOpen ? 'pointer-events-none' : '']"
    >
      <BasketProducts />
    </div>

    <AddProductInput v-if="useBasket.currentView === 'list'" />
  </div>
</template>
