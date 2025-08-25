<script setup>
import { computed } from "vue";

import { basket } from "@/stores/basket";
const useBasket = basket();

import BasketEntry from "./BasketEntry.vue";
import pwaManager from "@/includes/pwa";

const filteredBasketEntries = computed(() => {
  let result = useBasket?.products || [];

  if (result.length > 0 && useBasket.currentView === "list") {
    result = result.filter(entry => entry?.is_added);
    result = result.sort((b, a) => new Date(b.last_added_at) - new Date(a.last_added_at));
  } else if (result.length > 0 && useBasket.currentView === "grid") {
    if (useBasket.filters.showOnlyAdded) {
      result = result.filter(entry => entry?.is_added);
    }
    result = result.sort((a, b) => a.name.localeCompare(b.name));
  }

  let input = (useBasket?.newProductInput || "").trim().toLowerCase();

  if (input.length > 0) {
    result = result.filter(entry => (entry?.name || "").toLowerCase().includes(input));
  }
  return result;
});

const showInstallButton = computed(() => {
  return pwaManager.shouldShowInstallPrompt();
});

const installApp = async () => {
  await pwaManager.installApp();
};
</script>

<template>
  <div
    class="w-full flex flex-col items-center h-full transition-all duration-75"
    :class="[!useBasket.loading.basketProducts && filteredBasketEntries?.length === 0 ? 'translate-x-[-30px]' : '']"
  >
    <div
      v-if="useBasket.newProductInput.trim().length > 0 && filteredBasketEntries.length === 0"
      class="w-full flex flex-col h-full gap-4 mt-8 text-center max-w-[250px]"
    >
      <p class="text-gray-500 flex flex-col">
        <span class="font-semibold text-gray-700">{{ useBasket.newProductInput.trim() }}</span>
        <span>{{ $t("not-in-basket") }}</span>
      </p>
    </div>

    <div
      v-if="filteredBasketEntries?.length > 0 && !useBasket.loading.basketProducts"
      class="w-full gap-3 items-center p-3 pt-4 pb-8"
      :class="[useBasket.currentView === 'grid' ? 'grid grid-cols-2' : 'flex flex-col-reverse gap-3']"
      v-auto-animate="{ duration: 75 }"
    >
      <BasketEntry v-for="entry in filteredBasketEntries" :key="entry.id" :entry="entry" />
    </div>

    <div v-else-if="useBasket.loading.basketProducts" class="w-full flex flex-col items-center h-full justify-center">
      <CIcon :icon="'line-md:loading-twotone-loop'" class="w-[100px] h-[100px] text-gray-500" />
    </div>

    <div
      v-else-if="!useBasket.loading.basketProducts && filteredBasketEntries?.length === 0"
      class="w-full flex flex-col items-center h-full justify-center gap-4"
    >
      <CIcon :icon="'streamline-color:happy-face-flat'" class="w-[100px] h-[100px] text-gray-500" />
      <p class="text-gray-500 font-bold">{{ $t("no-products-in-basket") }}</p>
      <p class="text-gray-500 text-center">{{ $t("add-products-to-your-basket") }}</p>

      <div class="flex flex-col gap-1 border-2 border-gray-300 rounded-2xl p-4" v-if="showInstallButton">
        <p class="text-gray-500 text-center">{{ $t("install-app-description") }}</p>
        <CButton :buttonType="'primary'" class="mt-4" @click="installApp">
          <CIcon :icon="'material-symbols:download'" class="w-[16px] h-[16px] mr-2" />
          {{ $t("install-app") }}
        </CButton>
      </div>
    </div>
  </div>
</template>
