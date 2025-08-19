<script setup>
import { useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

const router = useRouter();

const connectToAnotherBasket = () => {
  router.push("/");
  useBasket.burguerMenuOpen = false;
};

const connectToBasket = async slug => {
  if (await useBasket.checkIfBasketExists(slug)) {
    router.push("/");
    router.push(`/basket/${slug}`);
    useBasket.burguerMenuOpen = false;
  }
};

const removeRecentBasket = slug => {
  useBasket.connectedBaskets = useBasket.connectedBaskets.filter(basket => basket.slug !== slug);
};
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
      <div class="w-fit h-fit flex flex-col items-center justify-center pointer-events-auto">
        <p class="text-sm text-white font-semibold">{{ $t("current-basket") }}</p>
        <h1 class="text-2xl font-bold">{{ useBasket.currentBasket }}</h1>

        <CButton :buttonType="'secondary'" class="mt-4" @click="connectToAnotherBasket">{{
          $t("connect-to-another-basket")
        }}</CButton>

        <div class="flex flex-col gap-3 mt-6" v-if="useBasket.connectedBaskets?.length > 0">
          <p class="text-sm text-white font-semibold">{{ $t("connected-baskets") }}</p>

          <div class="flex flex-col gap-3 items-center max-h-[250px] overflow-y-auto">
            <div
              v-for="basket in useBasket.connectedBaskets.filter(basket => basket.slug !== useBasket.currentBasket)"
              :key="basket.slug"
              class="flex flex-row gap-3 items-center"
            >
              <CButton :key="basket.slug" :buttonType="'secondary'" @click="connectToBasket(basket.slug)">
                {{ basket.name }}
              </CButton>
              <button class="text-sm text-white font-semibold" @click="removeRecentBasket(basket.slug)">
                <CIcon :icon="'line-md:close'" class="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 right-0 p-4">
        <p class="text-sm text-white font-semibold">v{{ useBasket.basketAppVersion }}</p>
      </div>
    </div>
  </div>
</template>
