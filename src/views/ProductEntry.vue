<script setup>
import { computed } from "vue";

import { basket } from "@/stores/basket";
const useBasket = basket();
import moment from "moment";

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});

const isInBasket = computed(() => {
  return useBasket.basketProducts.some(product => product.product_id === props.entry.id);
});
</script>
<template>
  <div
    class="w-full py-2 flex flex-col justify-between items-center gap-2 transition-all duration-100 rounded-lg h-[90px] border-2 border-gray-300"
    :class="[isInBasket ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-700']"
  >
    <p class="text-sm text-center leading-none font-semibold px-2">{{ props.entry.name }}</p>

    <!-- ADD TO BASKET BUTTON -->
    <button
      class="cursor-pointer rounded-full p-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white group/button active:brightness-[1.3] transition-all duration-100 active:delay-[-50ms]"
      :class="[isInBasket ? 'bg-rose-400' : 'bg-emerald-500']"
      @click="
        () => {
          if (isInBasket) {
            useBasket.removeProductFromBasket(props.entry.id);
          } else {
            useBasket.addProductToBasket(props.entry.name);
          }
        }
      "
    >
      <CIcon
        :icon="isInBasket ? 'material-symbols:remove-shopping-cart' : 'material-symbols:add-shopping-cart'"
        class="transition-all duration-100 text-xl group-active/button:scale-[1.8] transition-all duration-100 group-active/button:delay-[-50ms]"
      />
    </button>
  </div>

  <div class="w-full grid grid-cols-2 gap-2 p-3" v-if="false">
    <p class="font-semibold">{{ $t("times-added-to-basket") }}</p>
    <p class="font-semibold">{{ props.entry.times_added }}</p>

    <p class="font-semibold">{{ $t("last-added-at") }}</p>
    <p class="font-semibold">{{ moment(props.entry.last_added_at).format("DD/MM/YYYY HH:mm") }}</p>
  </div>

  <div class="w-full flex justify-center mb-3" v-if="useBasket.productDetailsId === props.entry.id">
    <CButton
      class="w-fit"
      @onClick="useBasket.removeProductPermanently(props.entry.id)"
      :safetyConfirmation="true"
      :isLoading="useBasket.loading.removeProductPermanentlyIds.includes(props.entry.id)"
    >
      <CIcon :icon="'material-symbols:delete'" />
      {{ $t("remove") }}
    </CButton>
  </div>
</template>
