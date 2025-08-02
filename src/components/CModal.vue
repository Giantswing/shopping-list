<script setup>
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits(["update:showIf", "onClose"]);

const closeModal = () => {
   if (props.showIf == true) {
      emit("onClose");
   }
};

onMounted(() => {
   window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
         closeModal();
      }
   });
});

onUnmounted(() => {
   window.removeEventListener("keydown", (e) => {
      if (e.key === "Escape") {
         closeModal();
      }
   });
});

const props = defineProps({
   inlineClass: {
      type: String,
      default: "",
      required: false,
   },
   showIf: {
      type: Boolean,
      default: false,
      required: true,
   },
   modalTitle: {
      type: String,
      default: "",
      required: false,
   },
   headerColor: {
      type: String,
      default: "bg-blue-active",
      required: false,
   },
   contentColor: {
      type: String,
      default: "bg-white",
      required: false,
   },
   isSmaller: {
      type: Boolean,
      default: false,
      required: false,
   },
   customMaxWidth: {
      type: String,
      default: "max-w-[1000px]",
      required: false,
   },
   isLoading: {
      type: Boolean,
      default: false,
      required: false,
   },
   customStyle: {
      type: String,
      default: "",
      required: false,
   },
   ignoreSideBar: {
      type: Boolean,
      default: true,
      required: false,
   },
   disableClosing: {
      type: Boolean,
      default: false,
      required: false,
   },
});

</script>

<template>
   <div
      class="fixed flex justify-center items-center inset-0 z-[999] pointer-events-none"
   >
      <Transition
         enter-from-class="opacity-0"
         leave-to-class="opacity-0"
         enter-active-class="transition duration-300"
         leave-active-class="transition duration-300"
      >
         <div
            v-if="showIf"
            @click="() => {
               if(disableClosing == false) {
                  $emit('onClose');
               }
            }"
            class="pointer-events-auto fixed inset-0 z-20 bg-black bg-opacity-50"
         />
      </Transition>

      <MintySmoothHeight :showIf="showIf">
         <div
            class="z-50 fixed rounded-xl shadow-md w-[95%] md:w-[85%] lg:w-[80%] overflow-hidden pointer-events-auto transition-all duration-200"
            :class="[
               isSmaller == true ? 'max-w-[900px] w-[85%] md:w-[78%] lg:w-[72%]' : 'scale-100',
               customMaxWidth,
               contentColor,
               ignoreSideBar == false ? 'md:ml-[220px]' : '',
            ]"
         >

            <div
               class="w-full h-40 absolute top-0"
               :class="headerColor"
            />

            <div
               class="sticky top-0 z-50 flex items-center justify-between w-full p-3 md:p-4 md:px-6 text-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] pointer-events-auto" 
               :class="headerColor"
            >

               <h2 class="fluid-lg leading-tight text-center md:text-left md:leading-base font-semibold" v-html="modalTitle"></h2>
               <button
                  @click="() => {
                     if(disableClosing == false) {
                        $emit('onClose');
                     }
                  }"
                  class="flex items-center font-semibold text-center transition duration-150 origin-center group/close-button h-[32px] aspect-square"
               >
                  <MintyIcon :icon="'iconamoon:close-duotone'" class="text-white w-full h-full group-hover/close-button:scale-125 group-hover/close-button:opacity-50 group-active/close-button:scale-50 transition-all" />
               </button>
            </div>


            <div
               :class="[
                  'p-3 md:p-6 md:px-8 min-h-[150px] rounded-t-2xl min-w-full transition-all duration-200 relative',
                  inlineClass,
                  'scrollable',
                  isLoading ? '!max-h-[150px] overflow-hidden !pt-0' : 'max-h-[83vh] md:max-h-[90svh] overflow-y-auto overflow-x-hidden',
                  contentColor,

               ]"
               v-auto-animate
            >

               <div
                  class="bg-white min-w-full rounded-t-2xl overflow-hidden absolute inset-0 transition-all duration-300 slide-motion"
                  :class="[
                     isLoading ? 'opacity-100 !pt-0' : 'opacity-0 pointer-events-none',
                  ]"
               >
                  <div class="flex items-center justify-center h-full animate-pulse">

                      <MintyIcon :icon="'eos-icons:three-dots-loading'" class="z-10 ml-4 text-6xl text-gray-500 scale-150" />

                  </div>
               </div>

               <slot v-if="showIf && !isLoading" />
            </div>

         </div>
      </MintySmoothHeight>

   </div>
</template>

<style scoped>
.scrollable::-webkit-scrollbar {
   -webkit-appareance: none;
   @apply hidden md:block w-[7px];
}

.scrollable::-webkit-scrollbar-thumb {
   @apply w-2 bg-gray-500 rounded-full;
}

.slide-motion {
  animation: slide 1s infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #d5d5d5 50%, #f0f0f0 75%);
  background-size: 400% 400%;
  animation: gradient 1.5s infinite;
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

</style>

