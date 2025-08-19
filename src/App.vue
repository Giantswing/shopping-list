<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { basket } from "@/stores/basket";
const useBasket = basket();

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";

const checkOnlineStatus = () => {
  const isOffline = !navigator.onLine;
  // const isOffline = true;

  if (isOffline && !useBasket.offlineMode) {
    toast.warning(i18n.global.t("offline-mode-enabled"));
    useBasket.offlineMode = true;
  } else if (!isOffline && useBasket.offlineMode) {
    toast.success(i18n.global.t("back-online"));
    useBasket.offlineMode = false;
    useBasket.syncBasketState();
  }
};

onMounted(() => {
  // toast.success("Test message");
  checkOnlineStatus();
  window.addEventListener("online", checkOnlineStatus);
  window.addEventListener("offline", checkOnlineStatus);
});

// Dynamic height for viewport, adjusting for keyboard
const dynamicHeight = ref(window.innerHeight);

// Update height based on visualViewport or window resize
const updateHeight = () => {
  dynamicHeight.value = window.visualViewport ? window.visualViewport.height : window.innerHeight;
};

// Set initial height and listen for resize events
updateHeight();
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateHeight);
} else {
  window.addEventListener("resize", updateHeight);
}

// Cleanup event listeners on component unmount
onUnmounted(() => {
  window.removeEventListener("online", checkOnlineStatus);
  window.removeEventListener("offline", checkOnlineStatus);

  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", updateHeight);
  } else {
    window.removeEventListener("resize", updateHeight);
  }
});
</script>

<template>
  <CSaveLoad
    :localStoragePrefix="'shopping_list_v1_'"
    :values="[
      {
        key: 'connectedBaskets',
        value: useBasket.connectedBaskets,
        mode: 'local',
        change: value => (useBasket.connectedBaskets = value)
      },
      {
        key: 'lastUsedBasket',
        value: useBasket.lastUsedBasket,
        mode: 'local',
        change: value => (useBasket.lastUsedBasket = value)
      },
      {
        key: 'basketProducts',
        value: useBasket.basketProducts,
        mode: 'local',
        change: value => (useBasket.basketProducts = value)
      },
      {
        key: 'products',
        value: Array.from(useBasket.products.entries()),
        mode: 'local',
        change: value => (useBasket.products = new Map(value))
      }
    ]"
  />

  <div class="relative w-full flex flex-col items-center justify-center bg-blue-50" :style="{ height: dynamicHeight + 'px' }">
    <RouterView />
  </div>
</template>
