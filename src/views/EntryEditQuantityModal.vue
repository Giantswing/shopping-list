<script setup>
import { ref } from "vue";

import { basket } from "@/stores/basket";
const useBasket = basket();

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const localQuantity = ref(props.product.quantity);
</script>

<template>
  <Teleport to="body">
    <div class="z-[9999]" v-auto-animate="{ duration: 75 }">
      <div
        v-if="useBasket.editQuantityModal"
        class="fixed inset-0 bg-blue-800/70 z-50"
        @click="useBasket.closeEditQuantityModal(localQuantity)"
      />

      <div
        v-if="useBasket.editQuantityModal"
        class="fixed inset-0 flex flex-col justify-center items-center z-50 pointer-events-none"
      >
        <p
          class="text-center font-semibold text-sm text-white text-xl mb-4 max-w-[250px] leading-none select-none transition-all duration-100 flex flex-col items-center justify-center gap-2"
          :class="[useBasket.editQuantityModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-10px]']"
        >
          <span class="text-sm opacity-70">{{ $t("adjust-quantity") }}</span>
          <span class="text-3xl font-bold">{{ product.name }}</span>
        </p>

        <div
          class="flex flex-col items-center gap-2 bg-gray-200 rounded-full p-4 pointer-events-auto w-fit px-8 py-8 transition-all duration-100 border-b-[8px] border-x-4 border-b-black border-x-black border-opacity-20 border-t-4 border-t-gray-700"
          :class="[
            useBasket.editQuantityModal ? 'scale-[1] opacity-100 translate-y-0' : 'scale-[1.2] opacity-0 translate-y-[300px]'
          ]"
        >
          <button
            class="flex flex-col items-center gap-2 active:scale-[0.8] transition-all duration-100 active:delay-[-50ms]"
            @click="localQuantity++"
          >
            <CIcon :icon="'bxs:up-arrow'" class="w-[48px] h-[48px] text-blue-600" />
          </button>

          <Transition name="tr-bounce" mode="out-in">
            <p class="text-center font-bold text-sm text-gray-600 !text-4xl shrink-0" :key="localQuantity">
              {{ localQuantity }}
            </p>
          </Transition>

          <button
            :disabled="localQuantity === 1"
            class="flex flex-col items-center gap-2 active:scale-[0.8] transition-all duration-100 active:delay-[-50ms] disabled:opacity-50 disabled:cursor-not-allowed"
            @click="
              () => {
                if (localQuantity > 1) {
                  localQuantity--;
                }
              }
            "
          >
            <CIcon :icon="'bxs:down-arrow'" class="w-[48px] h-[48px] text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
