<script setup>
import { computed } from "vue";
import { basket } from "@/stores/basket";
const useBasket = basket();

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});

const type = computed(() => {
  return useBasket.types.find(t => t.value === props.entry?.type);
});
</script>

<template>
  <!-- LIST VIEW -->
  <div
    v-if="useBasket.currentView === 'list'"
    class="flex flex-row gap-2 items-center bg-transparent w-full rounded-full justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 h-[42px] shrink-0 border-2 border-blue-900/40"
    >
    <div class="flex justify-between items-center w-full h-full">
      <div
        class="flex justify-center items-center min-w-[56px] h-full bg-blue-300 gap-2 mr-[-14px] pr-2"
        @click.stop="useBasket.openEditQuantityModal(props.entry.id)"
      >
        <p class="text-center font-semibold text-sm text-blue-900">
          {{ useBasket.products.find(p => p.id === props.entry.id)?.quantity }}
        </p>
      </div>

      <div
        class="flex justify-center items-center w-full h-full gap-2 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.12)] z-10 px-1 relative bg-white overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-white rounded-full flex justify-center items-center"
          :style="{ backgroundColor: type?.color + '22' }"
        >
          <span class="block translate-x-[80%] rotate-[10deg] text-[80px] font-semibold text-white opacity-20">{{
            type?.emoji
          }}</span>
        </div>

        <p class="text-center leading-none z-10">{{ props.entry?.name }}</p>
      </div>

      <button class="bg-rose-400 px-4 h-full ml-[-14px] pl-5" @click.stop="useBasket.removeProductFromBasket(props.entry.id)">
        <CIcon :icon="'jam:delete-f'" class="w-[24px] h-[24px] text-gray-500 text-white" />
      </button>
    </div>
  </div>

  <!-- GRID VIEW -->
  <div
    v-else-if="useBasket.currentView === 'grid'"
    class="w-full py-1 flex flex-col justify-between items-center transition-all duration-100 rounded-[20px] h-[90px] border-2 group/entry active:scale-[1.2] transition-all duration-100 active:delay-[-50ms] px-[5px] active:z-50 relative overflow-hidden border-white"
    @click.stop="
      () => {
        if (props.entry.is_added == false) {
          useBasket.addProductToBasket(props.entry.name);
        }
      }
    "
    :class="[
      entry.is_added
        ? 'bg-white text-gray-800 shadow-md shadow-black/50 outline outline-2 outline-white'
        : 'bg-gray-100 opacity-[0.6] text-gray-800 border-gray-300',
      useBasket.filters.groupBy != 'none' && useBasket.currentView === 'grid' ? 'min-w-[120px] max-w-[120px]' : ''
    ]"
    :style="{
      outlineColor: type?.color
    }"
  >
    <div class="absolute inset-0 bg-white flex justify-center items-center" :style="{ backgroundColor: type?.color + '50' }">
      <span class="block translate-x-[20%] rotate-[10deg] text-[80px] font-semibold text-white opacity-20">{{
        type?.emoji
      }}</span>
    </div>

    <p
      class="text-sm text-center leading-none font-bold px-2 h-full flex items-center justify-center pb-2 line-clamp-2 text-ellipsis z-10"
    >
      {{ props.entry.name }}
    </p>

    <div class="flex flex-row gap-1 items-center w-full z-10" v-auto-animate="{ duration: 45 }">
      <!-- QUANTITY BUTTON -->
      <div
        v-if="props.entry.is_added"
        class="flex justify-center items-center w-[50%] h-full bg-blue-300 gap-2 rounded-l-[18px] rounded-r-md border-2 border-white"
        @click.stop="useBasket.openEditQuantityModal(props.entry.id)"
      >
        <p class="text-center font-semibold text-sm text-blue-900">{{ props.entry?.quantity }}</p>
      </div>

      <!-- ADD TO BASKET BUTTON -->
      <button
        v-if="props.entry.is_added"
        class="cursor-pointer rounded-full p-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white group/button active:brightness-[1.3] transition-all duration-100 active:delay-[-50ms] flex justify-center items-center border-2 border-white"
        :class="[
          props.entry.is_added ? 'bg-rose-400 rounded-r-[18px] rounded-l-md w-[50%]' : 'bg-emerald-500 w-[100%] rounded-[18px]'
        ]"
        @click="
          () => {
            if (props.entry.is_added) {
              useBasket.removeProductFromBasket(props.entry.id);
            } else {
              useBasket.addProductToBasket(props.entry.name);
            }
          }
        "
      >
        <CIcon
          :icon="props.entry.is_added ? 'jam:delete-f' : 'material-symbols:add-shopping-cart'"
          class="transition-all duration-100 text-xl group-active/button:scale-[1.8] transition-all duration-100 group-active/button:delay-[-50ms]"
        />
      </button>
    </div>
  </div>
</template>
