<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { basket } from "@/stores/basket";
const useBasket = basket();

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";

// Browser back functionality for burger menu and view state
let isHandlingPopState = false;

const handlePopState = event => {
  if (isHandlingPopState) return;

  isHandlingPopState = true;

  // First priority: close burger menu if open
  if (useBasket.burguerMenuOpen) {
    useBasket.burguerMenuOpen = false;
  }
  // Second priority: go back from products to list view
  else if (useBasket.currentView === "products") {
    useBasket.currentView = "list";
  }
  // If already in list view, prevent going back (do nothing)

  // Reset flag after a short delay to prevent double handling
  setTimeout(() => {
    isHandlingPopState = false;
  }, 100);
};

// Watch for burger menu state changes and update browser history
watch(
  () => useBasket.burguerMenuOpen,
  isOpen => {
    if (isHandlingPopState) return;

    if (isOpen) {
      window.history.pushState({ menuOpen: true }, "", window.location.href);
    }
  },
  { immediate: false }
);

// Watch for view state changes and update browser history
watch(
  () => useBasket.currentView,
  newView => {
    if (isHandlingPopState) return;

    if (newView === "products") {
      window.history.pushState({ view: "products" }, "", window.location.href);
    }
  },
  { immediate: false }
);

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

  // Add popstate listener for browser back functionality
  window.addEventListener("popstate", handlePopState);
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
  window.removeEventListener("popstate", handlePopState);

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

  <div
    class="relative w-full flex flex-col items-center justify-center max-w-xl mx-auto"
    :style="{ height: dynamicHeight + 'px' }"
  >
    <RouterView />
  </div>
</template>
