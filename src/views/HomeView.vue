<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter } from "vue-router";
import i18n from "../includes/i18n.js";

import { basket } from "@/stores/basket";
const useBasket = basket();

const router = useRouter();
const basketSlug = ref("");
const mode = ref("connect");

onMounted(async () => {
  document.title = "Basketi";

  useBasket.resetNewBasketData();
  useBasket.resetConnectBasketData();

  document.addEventListener("keydown", event => {
    handleEnterKey(event);
  });
});

watch(
  () => useBasket.lastUsedBasket,
  newValue => {
    if (newValue && useBasket.connectedBaskets.some(basket => basket.slug === newValue)) {
      router.push(`/basket/${newValue}`);
    }
  },
  { immediate: true }
);

watch(
  () => useBasket.connectedBaskets,
  newValue => {
    if (useBasket.lastUsedBasket && newValue.some(basket => basket.slug === useBasket.lastUsedBasket)) {
      router.push(`/basket/${useBasket.lastUsedBasket}`);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEnterKey);
});

const connectToBasket = async slug => {
  if (await useBasket.checkIfBasketExists(slug)) {
    router.push(`/basket/${slug}`);
  }
};

const doPasswordsMatch = computed(() => {
  return useBasket.newBasketData.password === useBasket.newBasketData.repeatPassword;
});

const handleEnterKey = async event => {
  if (event.key === "Enter") {
    if (mode.value === "connect") {
      console.log("handleEnterKey", basketSlug.value);
      if (basketSlug.value.length > 0) {
        if (await useBasket.checkIfBasketExists(basketSlug.value)) {
          router.push(`/basket/${basketSlug.value}`);
        }
      }
    } else if (mode.value === "create") {
      console.log("handleEnterKey", useBasket.newBasketData);
      if (
        useBasket.newBasketData?.name?.length > 0 &&
        useBasket.newBasketData?.password?.length > 0 &&
        useBasket.newBasketData?.repeatPassword?.length > 0 &&
        doPasswordsMatch.value
      ) {
        handleCreateBasket();
      }
    }
  }
};

const handleCreateBasket = async () => {
  if (
    useBasket.newBasketData?.name?.length > 0 &&
    useBasket.newBasketData?.password?.length > 0 &&
    useBasket.newBasketData?.repeatPassword?.length > 0 &&
    doPasswordsMatch.value
  ) {
    if (await useBasket.createBasket()) {
      router.push(`/basket/${useBasket.currentBasket}`);
    }
  }
};

const handleConnectInput = () => {
  let result = basketSlug.value;
  result = result.toLowerCase();
  result = result.replace(/ /g, "-");

  basketSlug.value = result;
};
</script>

<template>
  <div class="w-full max-w-md p-6 bg-white rounded-3xl flex flex-col items-center gap-2 border-8 border-blue-50">
    <!-- LOGO IMAGE -->
    <div class="w-[120px] h-[120px] rounded-full bg-white flex items-center justify-center mb-4">
      <img src="/basketi-logo.svg" class="w-full h-full scale-[0.8]" />
    </div>
    <h1 class="text-2xl font-bold mb-4 mt-[-40px] text-blue-400">Basketi</h1>

    <div
      :class="[
        'transition-all duration-500 overflow-hidden flex flex-col items-center',
        mode === 'connect' ? 'max-h-[100px] mt-2 opacity-100' : 'max-h-[0px] opacity-0'
      ]"
    >
      <h3 class="text-sm text-gray-500 -skew-x-[10deg]">{{ $t("connect-basket") }}</h3>
      <input
        @input="handleConnectInput"
        class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
        v-model="basketSlug"
        type="text"
        :placeholder="$t('basket-slug-placeholder')"
        autofocus
      />
    </div>

    <!-- Multi function button (connect, create or go back to connect)-->
    <CButton
      class="my-4 mt-6"
      :buttonType="'secondary'"
      :isLoading="useBasket.loading.checkIfBasketExists"
      @onClick="
        async () => {
          if (basketSlug?.length > 0) {
            if (await useBasket.checkIfBasketExists(basketSlug)) {
              router.push(`/basket/${basketSlug}`);
            }
          } else {
            if (mode === 'connect') {
              mode = 'create';
            } else {
              mode = 'connect';
            }
          }
        }
      "
    >
      <span v-if="basketSlug?.length > 0">{{ $t("connect") }}</span>
      <span v-else-if="mode === 'connect'">{{ $t("or-create-new-basket") }}</span>
      <span v-else class="flex items-center gap-2">
        <CIcon :icon="'line-md:arrow-left'" />
        {{ $t("go-back-to-connect") }}
      </span>
    </CButton>

    <!-- Other connected baskets -->
    <div
      class="flex flex-col gap-2 overflow-hidden transition-all duration-500"
      :class="[mode === 'connect' ? 'max-h-[200px] mt-2 opacity-100 overflow-y-auto' : 'max-h-[0px] opacity-0']"
      v-if="
        useBasket.connectedBaskets?.length > 0 &&
          useBasket.connectedBaskets.filter(basket => basket.slug !== useBasket.currentBasket).length > 0
      "
    >
      <p class="text-sm text-gray-500">{{ $t("connected-baskets") }}</p>
      <div class="flex flex-col gap-2">
        <CButton
          v-for="basket in useBasket.connectedBaskets"
          :key="basket.slug"
          :buttonType="'secondary'"
          @click="connectToBasket(basket.slug)"
          :isLoading="useBasket.loading.checkIfBasketExists"
        >
          {{ basket.name }}
        </CButton>
      </div>
    </div>

    <!-- Create basket -->
    <div
      :class="[
        'transition-all duration-500 overflow-hidden flex flex-col items-center gap-4',
        mode === 'create' ? 'max-h-[400px] mt-2' : 'max-h-[0px]'
      ]"
    >
      <input
        class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
        v-model="useBasket.newBasketData.name"
        type="text"
        :placeholder="$t('basket-name-placeholder')"
      />

      <input
        class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
        v-model="useBasket.newBasketData.password"
        :type="mode === 'create' ? 'password' : 'text'"
        :placeholder="$t('basket-password-placeholder')"
      />

      <input
        class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
        v-model="useBasket.newBasketData.repeatPassword"
        :type="mode === 'create' ? 'password' : 'text'"
        :placeholder="$t('basket-repeat-password-placeholder')"
      />

      <div class="text-sm text-red-500" v-if="!doPasswordsMatch">{{ $t("passwords-do-not-match") }}</div>

      <CButton
        class="my-4 mt-6"
        :buttonType="'secondary'"
        :disabled="
          !doPasswordsMatch ||
            useBasket.newBasketData?.name?.length === 0 ||
            useBasket.newBasketData?.password?.length === 0 ||
            useBasket.newBasketData?.repeatPassword?.length === 0
        "
        @onClick="handleCreateBasket"
        :isLoading="useBasket.loading.createBasket"
      >
        {{ $t("create-basket") }}
      </CButton>
    </div>
  </div>
</template>
