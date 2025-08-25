<script setup>
import { basket } from "@/stores/basket";
const useBasket = basket();

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <!-- LIST VIEW -->
  <div
    v-if="useBasket.currentView === 'list'"
    class="flex flex-row gap-2 items-center bg-transparent w-full rounded-full justify-between text-sm font-semibold text-blue-900 select-none overflow-hidden transition-all duration-300 h-[42px] shrink-0 border-2 border-blue-900/20"
    :class="[
      useBasket.loading.removeProductFromBasketIds.includes(props.entry.id)
        ? 'opacity-50 saturate-0 cursor-not-allowed pointer-events-none'
        : ''
    ]"
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
        class="flex justify-center items-center w-full h-full gap-2 bg-blue-100 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.2)] z-10 px-1"
      >
        <p v-if="props.entry.offline" class="text-center font-semibold text-xs text-gray-600">Offline</p>
        <p class="text-center leading-none">{{ useBasket.products.find(p => p.id === props.entry.id)?.name }}</p>
      </div>

      <button class="bg-rose-400 px-4 h-full ml-[-14px] pl-5" @click.stop="useBasket.removeProductFromBasket(props.entry.id)">
        <CIcon :icon="'jam:delete-f'" class="w-[24px] h-[24px] text-gray-500 text-white" />
      </button>
    </div>
  </div>

  <!-- GRID VIEW -->
  <div
    v-else-if="useBasket.currentView === 'grid'"
    class="w-full py-1 flex flex-col justify-between items-center transition-all duration-100 rounded-[20px] h-[90px] border-2 group/entry active:scale-[1.2] transition-all duration-100 active:delay-[-50ms] px-[5px] active:z-50"
    @click.stop="
      () => {
        if (props.entry.is_added == false) {
          useBasket.addProductToBasket(props.entry.name);
        }
      }
    "
    :class="[
      entry.is_added
        ? 'bg-blue-50 text-blue-800 border-blue-500/50 shadow-md outline outline-2 outline-white'
        : 'bg-gray-100 opacity-[0.6] text-gray-800 border-gray-300',
      useBasket.filters.groupBy != 'none' && useBasket.currentView === 'grid' ? 'min-w-[120px] max-w-[120px]' : ''
    ]"
  >
    <p
      class="text-sm text-center leading-none font-semibold px-2 h-full flex items-center justify-center pb-2 line-clamp-2 text-ellipsis"
    >
      {{ props.entry.name }}
    </p>

    <div class="flex flex-row gap-1 items-center w-full" v-auto-animate="{ duration: 45 }">
      <!-- QUANTITY BUTTON -->
      <div
        v-if="props.entry.is_added"
        class="flex justify-center items-center w-[50%] h-full bg-blue-300 gap-2 rounded-l-[18px] rounded-r-md"
        @click.stop="useBasket.openEditQuantityModal(props.entry.id)"
      >
        <p class="text-center font-semibold text-sm text-blue-900">
          {{ useBasket.products.find(p => p.id === props.entry.id)?.quantity }}
        </p>
      </div>

      <!-- ADD TO BASKET BUTTON -->
      <button
        v-if="props.entry.is_added"
        class="cursor-pointer rounded-full p-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white group/button active:brightness-[1.3] transition-all duration-100 active:delay-[-50ms] flex justify-center items-center "
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
