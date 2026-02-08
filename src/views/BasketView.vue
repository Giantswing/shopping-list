<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";
import BurguerMenu from "@/views/BurguerMenu.vue";
import EntryEditQuantityModal from "@/views/EntryEditQuantityModal.vue";

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
  <div class="flex flex-col w-full h-full relative">
    <h3
      class="absolute top-0 left-0 w-full font-bold text-center text-blue-700 px-4 select-none z-[60] pointer-events-none mt-[64px] transition-all duration-500"
      :class="[useBasket.burguerMenuOpen ? 'opacity-0' : 'opacity-40']"
    >
      {{ useBasket?.connectedBaskets?.find(basket => basket.slug === useBasket.currentBasket)?.name || "Loading..." }}
    </h3>

    <BurguerMenu />

    <div
      class="flex-grow min-h-0 w-full overflow-y-auto overflow-x-hidden"
      :class="[useBasket.burguerMenuOpen ? 'pointer-events-none' : '']"
    >
      <BasketList />
    </div>

    <AddProductInput />

    <EntryEditQuantityModal
      v-if="useBasket.productDetailsId"
      :product="useBasket.products.find(p => p.id === useBasket.productDetailsId) || {}"
    />
  </div>
</template>
