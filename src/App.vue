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

  // When an input is focused (e.g. add product), re-measure viewport after a tick so the keyboard resize is captured (helps on iOS)
  window.addEventListener("focusin", onInputFocusForViewport);
});

// Dynamic height for viewport, adjusting for keyboard
const dynamicHeight = ref(window.innerHeight);

const onInputFocusForViewport = () => {
  requestAnimationFrame(() => {
    updateHeight();
    setTimeout(updateHeight, 100);
    setTimeout(updateHeight, 300);
  });
};

// Update height based on visualViewport or window resize (keyboard open = smaller height)
const updateHeight = () => {
  dynamicHeight.value = window.visualViewport ? window.visualViewport.height : window.innerHeight;
};

// Set initial height and listen for resize + scroll (scroll fires when keyboard opens on some iOS)
updateHeight();
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateHeight);
  window.visualViewport.addEventListener("scroll", updateHeight);
} else {
  window.addEventListener("resize", updateHeight);
}

// Cleanup event listeners on component unmount
onUnmounted(() => {
  window.removeEventListener("online", checkOnlineStatus);
  window.removeEventListener("offline", checkOnlineStatus);
  window.removeEventListener("popstate", handlePopState);

  window.removeEventListener("focusin", onInputFocusForViewport);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", updateHeight);
    window.visualViewport.removeEventListener("scroll", updateHeight);
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
        key: 'showOnlyAdded',
        value: useBasket.filters.showOnlyAdded,
        mode: 'local',
        change: value => (useBasket.filters.showOnlyAdded = value)
      },
      {
        key: 'groupBy',
        value: useBasket.filters.groupBy,
        mode: 'local',
        change: value => (useBasket.filters.groupBy = value)
      },
      {
        key: 'currentView',
        value: useBasket.currentView,
        mode: 'local',
        change: value => (useBasket.currentView = value)
      },
      {
        key: 'lastUsedBasket',
        value: useBasket.lastUsedBasket,
        mode: 'local',
        change: value => (useBasket.lastUsedBasket = value)
      },
      {
        key: 'products',
        value: useBasket.products,
        mode: 'local',
        change: value => (useBasket.products = value)
      }
    ]"
  />

  <div
    class="relative w-full flex flex-col items-center justify-center max-w-xl mx-auto overflow-hidden min-h-0"
    :style="{ height: dynamicHeight + 'px', maxHeight: dynamicHeight + 'px' }"
  >
    <div class="flex-1 min-h-0 w-full flex flex-col">
      <RouterView />
    </div>
  </div>
</template>
