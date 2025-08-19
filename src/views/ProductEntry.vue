<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();
import moment from "moment";

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});
</script>
<template>
  <div
    class="flex flex-row gap-2 items-center bg-blue-200 w-full rounded-md justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 shrink-0 cursor-pointer"
  >
    <div class="flex flex-col items-center w-full h-full" v-auto-animate="{ duration: 75 }">
      <p
        class="text-center w-full bg-white bg-opacity-20 py-3 flex flex-row items-center justify-center gap-2"
        @click="
          () => {
            if (useBasket.productDetailsId === props.entry.id) {
              useBasket.productDetailsId = null;
            } else {
              useBasket.productDetailsId = props.entry.id;
            }
          }
        "
      >
        <span>{{ props.entry.name }}</span>
        <CIcon
          :icon="'material-symbols:chevron-left'"
          class="transition-all duration-100 text-xl"
          :class="[useBasket.productDetailsId === props.entry.id ? '-rotate-90' : 'rotate-0']"
        />
      </p>

      <div class="w-full grid grid-cols-2 gap-2 p-3" v-if="useBasket.productDetailsId === props.entry.id">
        <p class="font-semibold">{{ $t("times-added-to-basket") }}</p>
        <p class="font-semibold">{{ props.entry.times_added }}</p>

        <p class="font-semibold">{{ $t("last-added-at") }}</p>
        <p class="font-semibold">{{ moment(props.entry.last_added_at).format("DD/MM/YYYY HH:mm") }}</p>
      </div>

      <div class="w-full flex justify-center mb-3" v-if="useBasket.productDetailsId === props.entry.id">
        <CButton
          class="w-fit"
          @onClick="useBasket.removeProductFromList(props.entry.id)"
          :safetyConfirmation="true"
          :isLoading="useBasket.loading.removeProductFromListIds.includes(props.entry.id)"
        >
          <CIcon :icon="'material-symbols:delete'" />
          {{ $t("remove") }}
        </CButton>
      </div>
    </div>
  </div>
</template>
