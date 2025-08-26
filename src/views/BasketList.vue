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
    // result = result.sort((b, a) => new Date(b.last_added_at) - new Date(a.last_added_at));
    result = result.sort((a, b) => a.type.localeCompare(b.type));
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

const groups = computed(() => {
  if (useBasket.filters.groupBy === "none") {
    return [];
  }

  let groups = [];
  let currentGroup = "";

  /* Group by name (groups A, B, C, etc.) */
  if (useBasket.filters.groupBy === "name") {
    filteredBasketEntries.value.forEach(entry => {
      if (entry.name.charAt(0) !== currentGroup) {
        currentGroup = entry.name.charAt(0);
        groups.push({ name: currentGroup, entries: [] });
      }
      groups[groups.length - 1].entries.push(entry);
    });
  }

  /* Group by type */
  if (useBasket.filters.groupBy === "type") {
    const typeMap = {};
    useBasket.types.forEach(type => {
      const group = { name: type.value, entries: [] };
      groups.push(group);
      typeMap[type.value] = group;
    });
    // Assign entries to their respective type group
    filteredBasketEntries.value.forEach(entry => {
      if (typeMap[entry.type]) {
        typeMap[entry.type].entries.push(entry);
      }
    });
    // Optionally, remove empty groups (if you don't want to show them)
    groups = groups.filter(group => group.entries.length > 0);
  }

  groups.forEach(group => {
    group.entries.sort((a, b) => b.is_added - a.is_added);
  });

  return groups;
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
    class="w-full flex flex-col items-center h-full transition-all duration-75 rounded-t-[25px] relative pt-[90px]"
    v-auto-animate="{ duration: 75 }"
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

    <!-- LIST AND GRID (NORMAL) VIEW -->
    <div
      v-if="
        filteredBasketEntries?.length > 0 &&
          !useBasket.loading.basketProducts &&
          (useBasket.currentView === 'list' || (useBasket.currentView === 'grid' && useBasket.filters.groupBy === 'none'))
      "
      class="w-full items-center p-3 pt-1 pb-8"
      :class="[useBasket.currentView === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col-reverse gap-3']"
      v-auto-animate="{ duration: 75 }"
    >
      <BasketEntry v-for="entry in filteredBasketEntries" :key="entry.id" :entry="entry" />
    </div>

    <!-- GRID (GROUPED) VIEW -->
    <div
      v-if="
        useBasket.currentView === 'grid' &&
          (useBasket.filters.groupBy === 'name' || useBasket.filters.groupBy === 'type') &&
          groups.length > 0
      "
      v-auto-animate="{ duration: 75 }"
      class="w-full items-center p-3 pb-8"
    >
      <div v-for="group in groups" :key="group.name" class="w-full flex flex-col items-center mb-4 mt-[-10px]">
        <h3 class="text-sm font-semibold text-gray-800 uppercase mb-3 px-3 pb-1 w-full border-b-2 border-gray-300">
          <span v-if="useBasket.filters.groupBy === 'type'">{{ $t("types." + group.name) }}</span>
          <span v-else>{{ group.name }}</span>
        </h3>
        <div class="flex flex-row gap-2 overflow-x-auto w-full pb-3 pt-1 px-1">
          <BasketEntry v-for="entry in group.entries" :key="entry.id" :entry="entry" />
        </div>
      </div>
    </div>

    <div v-else-if="useBasket.loading.basketProducts" class="w-full flex flex-col items-center h-full justify-center">
      <CIcon :icon="'line-md:loading-twotone-loop'" class="w-[100px] h-[100px] text-gray-500" />
    </div>

    <div
      v-else-if="
        !useBasket.loading.basketProducts &&
          filteredBasketEntries?.length === 0 &&
          useBasket.newProductInput.trim().length === 0
      "
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
