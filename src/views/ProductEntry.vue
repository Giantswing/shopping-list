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
    class="flex flex-row gap-2 items-center bg-blue-200 w-full rounded-md justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 shrink-0 "
  >
    <div class="flex flex-col items-center w-full h-full">
      <p class="text-center w-full bg-white bg-opacity-20 py-2">{{ props.entry.name }}</p>
      <div class="w-full grid grid-cols-2 gap-2 p-3">
        <p class="font-semibold">{{ $t("times-added-to-basket") }}</p>
        <p class="font-semibold">{{ props.entry.times_added }}</p>

        <p class="font-semibold">{{ $t("last-added-at") }}</p>
        <p class="font-semibold">{{ moment(props.entry.last_added_at).format("DD/MM/YYYY HH:mm") }}</p>
      </div>
    </div>
  </div>
</template>
