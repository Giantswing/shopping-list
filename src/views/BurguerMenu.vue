<script setup>
import { ref, computed } from "vue";

import { useRouter } from "vue-router";

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";

import { basket } from "@/stores/basket";
const useBasket = basket();

import pwaManager from "@/includes/pwa.js";

const router = useRouter();
const changingMode = ref(false);

const connectToAnotherBasket = () => {
  router.push("/");
  useBasket.lastUsedBasket = "";
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
  }, 150);
};

const copyTextToClipboard = text => {
  if (!text) {
    text = window.location.href + "?pass=" + useBasket.getBasketCredentials(useBasket.currentBasket).password;
  }

  navigator.clipboard.writeText(text);
  toast.success(i18n.global.t("copied-to-clipboard"));
};

// PWA installation
const showInstallButton = computed(() => {
  // Use the reactive pwaStatus instead of calling the method directly
  const status = pwaStatus.value;
  const result = status.isMobile && !status.isStandalone && status.hasPrompt;
  return result;
});

const installApp = async () => {
  try {
    const success = await pwaManager.installApp();
    if (success) {
      toast.success(i18n.global.t("app-installed"));
    }
  } catch (error) {
    toast.error(i18n.global.t("install-failed"));
  }
};

// Debug PWA status (for development)
const pwaStatus = ref(pwaManager.getInstallationStatus());

const forceCheckPWA = async () => {
  const status = await pwaManager.forceCheck();
  pwaStatus.value = status;
};

// Update PWA status periodically
const updatePWAStatus = () => {
  pwaStatus.value = pwaManager.getInstallationStatus();
};

// Update status every second for debugging
setInterval(updatePWAStatus, 1000);
</script>

<template>
  <div class="absolute top-0 left-0 z-50 w-full h-full overflow-hidden pointer-events-none">
    <!-- Top horizontal bar with all items -->
    <div
      class="w-full flex flex-row items-start justify-between px-4 pt-3 z-30 pointer-events-none relative bg-gradient-to-b from-white from-70% to-transparent h-[90px]"
    >
      <!-- Animated expanding background, centered on the button -->
      <div class="pointer-events-auto z-[70] absolute left-4 top-3">
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
      <div class="z-[80] relative">
        <button
          class="rounded-full p-6 pointer-events-auto active:scale-[0.5] transition-all duration-100 active:delay-[-50ms]"
          @click="useBasket.burguerMenuOpen = !useBasket.burguerMenuOpen"
        >
          <CIcon
            :icon="useBasket.burguerMenuOpen ? 'line-md:close' : 'gg:options'"
            class="w-[28px] h-[28px] text-white absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </button>
      </div>

      <!-- Mode select -->
      <div
        class="relative flex flex-row gap-2 outline outline-4 outline-white rounded-full bg-gray-200 items-center overflow-hidden shadow-[0px_0_8px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        <!-- Animated background indicator -->
        <div
          class="absolute top-1/2 -translate-y-1/2 transition-all duration-200 rounded-full bg-emerald-500 z-0 border-l-2 border-r-2 border-l-white border-r-black border-opacity-20 shadow-[0px_0_20px_rgba(0,0,0,0.4)]"
          :class="[changingMode ? 'scale-x-[1.8] delay-[-15ms]' : 'scale-x-[1]']"
          :style="{
            left: useBasket.currentView === 'list' ? '0%' : 'calc(50% + 3px)',
            width: '48px',
            height: '48px'
          }"
        ></div>
        <button
          class="relative z-10 rounded-full w-[48px] h-[48px] flex items-center justify-center"
          @click="changeMode('list')"
        >
          <CIcon
            :icon="'typcn:th-list'"
            class="w-[28px] h-[28px] transition-all duration-100"
            :class="[useBasket.currentView === 'list' ? 'text-white' : 'text-gray-500']"
          />
        </button>

        <button
          class="relative z-10 rounded-full w-[48px] h-[48px] flex items-center justify-center"
          @click="changeMode('grid')"
        >
          <CIcon
            :icon="'fluent:grid-24-filled'"
            class="w-[28px] h-[28px] transition-all duration-100"
            :class="[useBasket.currentView === 'grid' ? 'text-white' : 'text-gray-500']"
          />
        </button>
      </div>

      <!-- DELETE ALL ITEMS BUTTON -->
      <CButton
        class="pointer-events-auto"
        :addedClass="'w-[48px] h-[48px] !bg-rose-400 !border-red-300 !p-0'"
        @onClick="useBasket.removeAllProductsFromBasket()"
        :isLoading="useBasket.loading.removeAllProductsFromBasket"
        :isDisabled="useBasket.offlineMode || useBasket.products.filter(p => p.is_added).length === 0"
        :safetyConfirmation="true"
        :safetyConfirmationIcon="true"
      >
        <CIcon :icon="'material-symbols:delete-sweep-outline-rounded'" class="w-[32px] h-[32px] text-white" />
      </CButton>
    </div>

    <!-- BURGUER MENU -->
    <div
      class="z-50 pointer-events-none absolute top-0 left-0 w-full h-full flex justify-center items-center overflow-y-auto transition-all duration-[250ms] delay-[200ms]"
      :class="[useBasket.burguerMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full']"
    >
      <div class="w-fit h-fit flex flex-col items-center justify-center pointer-events-auto mt-[-130px]">
        <!-- LOGO IMAGE -->

        <div class="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center mb-4">
          <img src="/basketi-logo.svg" class="w-full h-full scale-[0.8]" />
        </div>

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

        <!-- PWA Install Button in main menu -->
        <CButton v-if="showInstallButton" :buttonType="'primary'" class="mt-4" @click="installApp">
          <CIcon :icon="'material-symbols:download'" class="w-[16px] h-[16px] mr-2" />
          {{ $t("install-app") }}
        </CButton>

        <!-- Debug PWA Status (only if the basket is called cesta) -->
        <div
          v-if="useBasket.connectedBaskets?.find(basket => basket.slug === useBasket.currentBasket)?.name === 'cesta'"
          class="mt-4 p-3 bg-white bg-opacity-10 rounded-lg text-xs text-white max-h-[100px] overflow-y-auto"
        >
          <p><strong>PWA Debug:</strong></p>
          <p>Mobile: {{ pwaStatus?.isMobile }}</p>
          <p>Standalone: {{ pwaStatus?.isStandalone }}</p>
          <p>Valid Manifest: {{ pwaStatus?.hasValidManifest }}</p>
          <p>Service Worker: {{ pwaStatus?.hasServiceWorker }}</p>
          <p>Can Install: {{ pwaStatus?.canInstall }}</p>
          <p>Has Prompt: {{ pwaStatus?.hasPrompt }}</p>
          <p>Show Button: {{ showInstallButton }}</p>
          <button @click="forceCheckPWA" class="mt-2 px-2 py-1 bg-blue-500 rounded text-xs">Force Check</button>
        </div>

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
              <CButton :key="basket.slug" :buttonType="'secondary'" @click="connectToBasket(basket.slug)" :isLoading="useBasket.loading.checkIfBasketExists">
                {{ basket.name }}
              </CButton>
              <button class="text-sm text-white font-semibold" @click="removeRecentBasket(basket.slug)">
                <CIcon :icon="'line-md:close'" class="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full flex justify-between py-3 px-6 pointer-events-auto items-center">
        <!-- BUY ME A COFFEE ICON -->
        <a class="text-white font-semibold translate-y-[-4px]" href="https://www.buymeacoffee.com/giantswing" target="_blank">
          <img src="/bmc-brand-icon.svg" class="w-[180px] h-[40px]" />
        </a>

        <p class="flex flex-col items-center justify-center">
          <span>Basketi</span>
          <span class="text-sm text-white font-bold mt-[-10px] mr-[-10px]">v{{ useBasket.basketAppVersion }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
