<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();
</script>

<template>
  <div class="w-full flex flex-col gap-2 items-center bg-white z-20 p-1 pb-2">
    <div class="w-full flex flex-col gap-2 items-center border-t-2 border-blue-100 pt-2 rounded-t-xl">
      <h2 class="text-xs font-semibold text-blue-600">{{ $t("new-buy-message") }}</h2>
      <input
        v-model="useBasket.newProductInput"
        class="w-full border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1"
        @blur="useBasket.newProductInput = ''"
      />
    </div>

    <div
      :class="[
        'transition-all duration-100 overflow-hidden',
        useBasket.newProductInput.length > 0 ? 'max-h-[100px] mt-2' : 'max-h-[0px]'
      ]"
    >
      <CButton :addedClass="'!bg-blue-600 text-sm !rounded-full !px-8 !py-2'">
        <span>{{ $t("add-item") }}</span> <span class="font-bold">{{ useBasket.newProductInput }}</span>
      </CButton>
    </div>
  </div>
</template>
