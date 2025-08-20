<script setup>
import { ref } from "vue";

import { basket } from "@/stores/basket";
const useBasket = basket();

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});

const editQuantityModal = ref(false);
const openingEditQuantityModal = ref(false);
const quantity = ref(props.entry.quantity);

const openEditQuantityModal = () => {
  if (useBasket.offlineMode) {
    return;
  }

  editQuantityModal.value = true;
  setTimeout(() => {
    openingEditQuantityModal.value = true;
  }, 100);
};

const closeEditQuantityModal = async () => {
  openingEditQuantityModal.value = false;

  setTimeout(() => {
    editQuantityModal.value = false;
  }, 100);

  await useBasket.editProductQuantity(props.entry.product_id, quantity.value);

  quantity.value = props.entry.quantity;
};
</script>

<template>
  <div
    class="flex flex-row gap-2 items-center bg-blue-100 w-full rounded-md justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 h-[48px] shrink-0"
    :class="[
      useBasket.loading.removeProductFromBasketIds.includes(props.entry.product_id)
        ? 'opacity-50 saturate-0 cursor-not-allowed pointer-events-none'
        : ''
    ]"
  >
    <div class="flex justify-between items-center w-full h-full">
      <div class="flex justify-center items-center min-w-[56px] h-full bg-blue-200 gap-2" @click.stop="openEditQuantityModal">
        <p class="text-center font-semibold text-sm text-gray-600">{{ props.entry.quantity }}</p>
      </div>

      <div class="flex justify-center items-center w-full gap-2">
        <p v-if="props.entry.offline" class="text-center font-semibold text-xs text-gray-600">Offline</p>
        <p class="text-center leading-none">{{ useBasket.products.get(props.entry.product_id)?.name }}</p>
      </div>

      <button class="bg-red-400 px-4 h-full" @click.stop="useBasket.removeProductFromBasket(props.entry.product_id)">
        <CIcon :icon="'jam:delete-f'" class="w-[24px] h-[24px] text-gray-500 text-white" />
      </button>
    </div>

    <!-- EDIT QUANTITY MODAL -->
    <Teleport to="body">
      <div class="z-[9999]" v-auto-animate="{ duration: 75 }">
        <div v-if="editQuantityModal" class="fixed inset-0 bg-black/50 z-50" @click="closeEditQuantityModal" />

        <div v-if="editQuantityModal" class="fixed inset-0 flex flex-col justify-center items-center z-50 pointer-events-none">
          <p
            class="text-center font-semibold text-sm text-white text-xl mb-4 max-w-[250px] leading-none select-none transition-all duration-100 flex flex-col items-center justify-center gap-2"
            :class="[openingEditQuantityModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-10px]']"
          >
            <span class="text-sm">{{ $t("adjust-quantity") }}</span>
            <span class="text-3xl">{{ useBasket.products.get(props.entry.product_id)?.name }}</span>
          </p>

          <div
            class="flex flex-col items-center gap-2 bg-white rounded-full p-4 pointer-events-auto w-fit px-8 py-8 shadow-lg transition-all duration-100"
            :class="[
              openingEditQuantityModal ? 'scale-[1] opacity-100 translate-y-0' : 'scale-[1.2] opacity-0 translate-y-[300px]'
            ]"
          >
            <button
              class="flex flex-col items-center gap-2 active:scale-[0.8] transition-all duration-100 active:delay-[-50ms]"
              @click="quantity++"
            >
              <CIcon :icon="'bxs:up-arrow'" class="w-[48px] h-[48px] text-blue-600" />
            </button>

            <p class="text-center font-semibold text-sm text-gray-600 text-3xl">{{ quantity }}</p>

            <button
              :disabled="quantity === 1"
              class="flex flex-col items-center gap-2 active:scale-[0.8] transition-all duration-100 active:delay-[-50ms] disabled:opacity-50 disabled:cursor-not-allowed"
              @click="
                () => {
                  if (quantity > 1) {
                    quantity--;
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
  </div>
</template>
