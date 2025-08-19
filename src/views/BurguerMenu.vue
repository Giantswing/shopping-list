<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();
</script>

<template>
  <div class="absolute top-0 left-0 z-50 w-full h-full overflow-hidden pointer-events-none">
    <!-- Animated expanding background, centered on the button -->
    <div class="pointer-events-none z-10 absolute left-0 top-0 m-3">
      <div
        class="bg-blue-400 rounded-full"
        :class="[
          'transition-transform duration-1000',
          useBasket.burguerMenuOpen ? 'scale-[80] opacity-100' : 'scale-[1] opacity-100'
        ]"
        style="width:48px; height:48px;"
      ></div>
    </div>

    <!-- Button always on top -->
    <div class="m-3 absolute left-0 top-0 z-20">
      <button class="rounded-full p-6 pointer-events-auto" @click="useBasket.burguerMenuOpen = !useBasket.burguerMenuOpen">
        <CIcon
          :icon="'line-md:menu'"
          class="w-[32px] h-[32px] text-white absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </button>
    </div>

    <!-- BURGUER MENU -->
    <div
      class="z-50 pointer-events-none absolute top-0 left-0 w-full h-full flex justify-center items-center overflow-y-auto transition-all duration-500 delay-[200ms]"
      :class="[useBasket.burguerMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full']"
    >
      <div class="w-full h-full flex flex-col items-center justify-center">
        <p class="text-sm text-white font-semibold">{{ $t("current-basket") }}</p>
        <h1 class="text-2xl font-bold">{{ useBasket.currentBasket }}</h1>
      </div>
    </div>
  </div>
</template>
