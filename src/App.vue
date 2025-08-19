<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();
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

  <div class="relative w-full p-2 flex flex-col items-center justify-center bg-blue-50 h-[100svh]"><RouterView /></div>
</template>
