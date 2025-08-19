<script setup>
import { ref } from "vue";

import { useRouter } from "vue-router";

import toast from "@/includes/toast";
const useToast = toast();

import i18n from "@/includes/i18n.js";

import { basket } from "@/stores/basket";
const useBasket = basket();

const router = useRouter();
const changingMode = ref(false);

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

const changeMode = mode => {
  useBasket.currentView = mode;
  changingMode.value = true;
  setTimeout(() => {
    changingMode.value = false;
  }, 75);
};

const copyTextToClipboard = text => {
  if (!text) {
    text = window.location.href + "?pass=" + useBasket.getBasketCredentials(useBasket.currentBasket).password;
  }

  navigator.clipboard.writeText(text);
  useToast.success(i18n.global.t("copied-to-clipboard"));
};
</script>

<template>
  <div class="absolute top-0 left-0 z-50 w-full h-full overflow-hidden pointer-events-none">
    <!-- Other options -->
    <div class="m-3 absolute left-0 top-16 z-10 flex flex-col gap-3 pointer-events-auto">
      <!-- Mode select -->
      <div
        class="relative flex-col gap-2 outline outline-4 outline-white rounded-full bg-gray-200 flex items-center overflow-hidden"
      >
        <!-- Animated background indicator -->
        <div
          class="absolute left-1/2 -translate-x-1/2 transition-all duration-100 rounded-full bg-green-500 z-0 border-t-2 border-b-2 border-t-white border-b-black border-opacity-20"
          :class="[
            useBasket.currentView === 'list' ? 'shadow-[0_2px_10px_rgba(0,0,0,0.1)]' : 'shadow-[0_-2px_10px_rgba(0,0,0,0.1)]',
            changingMode ? 'scale-y-[1.8] delay-[-15ms]' : 'scale-y-[1]'
          ]"
          :style="{
            top: useBasket.currentView === 'list' ? '0%' : 'calc(50% + 3px)',
            width: '48px',
            height: '48px'
          }"
        ></div>
        <button
          class="relative z-10 rounded-full w-[48px] h-[48px] flex items-center justify-center"
          @click="changeMode('list')"
        >
          <CIcon
            :icon="'mingcute:basket-fill'"
            class="w-[32px] h-[32px] transition-all duration-100"
            :class="[useBasket.currentView === 'list' ? 'text-white' : 'text-gray-500']"
          />
        </button>

        <button
          class="relative z-10 rounded-full w-[48px] h-[48px] flex items-center justify-center"
          @click="changeMode('products')"
        >
          <CIcon
            :icon="'material-symbols:list-alt-rounded'"
            class="w-[32px] h-[32px] transition-all duration-100"
            :class="[useBasket.currentView === 'products' ? 'text-white' : 'text-gray-500']"
          />
        </button>
      </div>
    </div>

    <!-- Animated expanding background, centered on the button -->
    <div class="pointer-events-none z-10 absolute left-0 top-0 m-3">
      <div
        class="rounded-full"
        :class="[
          'transition-all duration-[550ms]',
          useBasket.burguerMenuOpen ? 'scale-[80] opacity-[0.95] bg-blue-500' : 'scale-[1] opacity-100 bg-blue-400'
        ]"
        style="width:48px; height:48px;"
      ></div>
    </div>

    <!-- Burguer Button always on top -->
    <div class="m-3 absolute left-0 top-0 z-20">
      <button class="rounded-full p-6 pointer-events-auto" @click="useBasket.burguerMenuOpen = !useBasket.burguerMenuOpen">
        <CIcon
          :icon="useBasket.burguerMenuOpen ? 'line-md:close' : 'line-md:menu'"
          class="w-[32px] h-[32px] text-white absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </button>
    </div>

    <!-- BURGUER MENU -->
    <div
      class="z-50 pointer-events-none absolute top-0 left-0 w-full h-full flex justify-center items-center overflow-y-auto transition-all duration-[250ms] delay-[200ms]"
      :class="[useBasket.burguerMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full']"
    >
      <div class="w-fit h-fit flex flex-col items-center justify-center pointer-events-auto">
        <p class="text-sm text-white font-semibold">{{ $t("current-basket") }}</p>
        <h1 class="text-2xl font-bold mb-4">
          {{ useBasket.connectedBaskets?.find(basket => basket.slug === useBasket.currentBasket)?.name }}
        </h1>

        <CButton :buttonType="'secondary'" @click="copyTextToClipboard()">
          <CIcon :icon="'solar:copy-bold-duotone'" class="w-[16px] h-[16px]" />
          {{ $t("share-basket") }}
        </CButton>

        <CButton :buttonType="'secondary'" class="mt-4" @click="connectToAnotherBasket"
          >{{ $t("connect-to-another-basket") }}
        </CButton>

        <div
          class="flex flex-col gap-3 mt-6"
          v-if="
            useBasket.connectedBaskets?.length > 0 &&
              useBasket.connectedBaskets.filter(basket => basket.slug !== useBasket.currentBasket).length > 0
          "
        >
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
