<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import i18n from "../includes/i18n.js";

import basket from "@/stores/basket";
const useBasket = basket();

const router = useRouter();
const basketSlug = ref("");

import toast from "@/includes/toast";
const useToast = toast();

const mode = ref("connect");

onMounted(() => {
  useBasket.resetNewBasketData();
  useBasket.resetConnectBasketData();
});
</script>

<template>
  <div class="w-full h-screen flex flex-col items-center justify-center">
    <div class="w-full max-w-md p-6 bg-white rounded flex flex-col items-center gap-2">
      <div
        :class="[
          'transition-all duration-500 overflow-hidden delay-100 flex flex-col items-center',
          mode === 'connect' ? 'max-h-[400px] mt-2' : 'max-h-[0px]'
        ]"
      >
        <h3 class="text-sm text-gray-500 -skew-x-[10deg]">{{ $t("connect-basket") }}</h3>
        <input
          class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
          v-model="basketSlug"
          type="text"
          :placeholder="$t('basket-slug-placeholder')"
          autofocus
        />
      </div>

      <!-- Multi function button (connect, create or go back to connect)-->
      <button
        class="text-sm text-gray-500 mt-2 border-2 border-gray-400 rounded-full px-4 py-1"
        @click="
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
      </button>

      <!-- Create basket -->
      <div :class="['transition-all duration-500 overflow-hidden', mode === 'create' ? 'max-h-[400px] mt-2' : 'max-h-[0px]']">
        <h3 class="text-sm text-gray-500 -skew-x-[10deg]">{{ $t("create-basket") }}</h3>
      </div>
    </div>
  </div>
</template>
