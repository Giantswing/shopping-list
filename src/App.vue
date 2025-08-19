<script setup>
import { ref, onUnmounted } from "vue";
import { basket } from "@/stores/basket";
const useBasket = basket();

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
      }
    ]"
  />

  <div class="relative w-full flex flex-col items-center justify-center bg-blue-50" :style="{ height: dynamicHeight + 'px' }">
    <RouterView />
  </div>
</template>
