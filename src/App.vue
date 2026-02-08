<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { basket } from "@/stores/basket";
const useBasket = basket();

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

onMounted(() => {
  // Add popstate listener for browser back functionality
  window.addEventListener("popstate", handlePopState);

  // When an input is focused (e.g. add product), re-measure viewport after a tick so the keyboard resize is captured (helps on iOS)
  window.addEventListener("focusin", onInputFocusForViewport);
});

// Dynamic viewport: on iOS the layout viewport doesn't resize when the keyboard opens,
// so we use position:fixed + full visualViewport rect so the app always fills the visible area.
const dynamicHeight = ref(window.innerHeight);
const viewportRect = ref({
  top: 0,
  left: 0,
  width: window.innerWidth,
  height: window.innerHeight
});

const onInputFocusForViewport = () => {
  requestAnimationFrame(() => {
    updateViewport();
    setTimeout(updateViewport, 100);
    setTimeout(updateViewport, 300);
  });
};

const updateViewport = () => {
  if (window.visualViewport) {
    const vv = window.visualViewport;
    dynamicHeight.value = vv.height;
    viewportRect.value = {
      top: vv.offsetTop,
      left: vv.offsetLeft,
      width: vv.width,
      height: vv.height
    };
  } else {
    dynamicHeight.value = window.innerHeight;
    viewportRect.value = {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

// Set initial size and listen for resize + scroll (scroll fires when keyboard opens on iOS)
updateViewport();
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateViewport);
  window.visualViewport.addEventListener("scroll", updateViewport);
} else {
  window.addEventListener("resize", updateViewport);
}

// Cleanup event listeners on component unmount
onUnmounted(() => {
  window.removeEventListener("popstate", handlePopState);

  window.removeEventListener("focusin", onInputFocusForViewport);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", updateViewport);
    window.visualViewport.removeEventListener("scroll", updateViewport);
  } else {
    window.removeEventListener("resize", updateViewport);
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
      }
    ]"
  />

  <div
    class="app-viewport-wrapper flex flex-col overflow-hidden min-h-0"
    :style="{
      position: 'fixed',
      top: viewportRect.top + 'px',
      left: viewportRect.left + 'px',
      width: viewportRect.width + 'px',
      height: viewportRect.height + 'px',
      maxHeight: viewportRect.height + 'px'
    }"
  >
    <div
      class="flex-1 min-h-0 flex flex-col"
      style="width: min(100%, 36rem); margin-left: auto; margin-right: auto;"
    >
      <RouterView />
    </div>
  </div>
</template>
