<script setup>
import { ref, onMounted } from "vue";
import i18n from "../includes/i18n.js";

import basket from "@/stores/basket";
const useBasket = basket();

import toast from "@/includes/toast";
const useToast = toast();

const mode = ref("connect");

onMounted(() => {
  useBasket.resetNewBasketData();
  useBasket.resetConnectBasketData();
});

const connectBasket = async () => {
  let exists = await useBasket.checkIfBasketExists(useBasket.connectBasketData.slug);
  if (exists) {
    window.location.href = `/${useBasket.connectBasketData.slug}`;
  } else {
    useToast.error(i18n.global.t("basket-not-found"));
  }
};
</script>

<template>
  <div class="w-full h-screen flex flex-col items-center justify-center">
    <div class="w-full max-w-md p-6 bg-white rounded flex flex-col items-center gap-2">
      <h3 class="text-sm text-gray-500 -skew-x-[10deg]">{{ $t("connect-basket") }}</h3>
      <input
        class="border-b-2 border-gray-400 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
        v-model="useBasket.connectBasketData.slug"
        type="text"
        :placeholder="$t('basket-slug-placeholder')"
      />

      <div
        :class="[
          'transition-all duration-100 overflow-hidden',
          useBasket.connectBasketData?.slug?.length > 0 ? 'max-h-[100px] mt-2' : 'max-h-[0px]'
        ]"
      >
        <CButton
          :addedClass="'!bg-blue-600 text-sm !rounded-full !px-8 !py-2'"
          :isLoading="useBasket.loading.checkIfBasketExists"
          @onClick="connectBasket"
        >
          <span>{{ $t("connect") }}</span>
        </CButton>
      </div>

      <h3 class="text-sm text-gray-500 -skew-x-[10deg] mt-2">{{ $t("or-create-new-basket") }}</h3>
    </div>
  </div>
</template>
