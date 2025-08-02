<script setup>
import { ref, computed } from "vue";

const pressed = ref(false);
const emit = defineEmits(["onClick"]);

const props = defineProps({
   inClass: {
      type: [String, Array],
      type: [String, Array],
      default: "px-6 py-4 h-10 font-semibold md:py-2 xl:px-10 bg-blue-active rounded-md text-white hover:brightness-[1.2] transition duration-100",
      required: false,
   },
   addedClass: {
      type: [String, Array],
      default: () => "",
      required: false,
   },
   addedClass: {
      type: [String, Array],
      default: () => "",
      required: false,
   },
   link: {
      default: null,
      required: false,
   },
   disabledLink: {
      default: false,
      required: false,
   },
   linkNewTab: {
      default: true,
      required: false,
   },
   delayClick: {
      default: false,
      required: false,
   },
   customClickClass: {
      default: null, 
      required: false,
   },
   isLoading: {
      default: false,
      required: false,
   },
   hideContentWhileLoading: {
      default: false,
      required: false,
   },
})

function handleClick() {
   if(props.isLoading) return;
   pressed.value = true;

   if(props.delayClick == false) {
      emit("onClick");

      setTimeout(() => {
         pressed.value = false;
      }, 200);
   } else {
      requestAnimationFrame(() => {
         setTimeout(() => {
            if(props.delayClick) {
               emit("onClick");
            }

            pressed.value = false;
         }, 200);
      });
   }
}

</script>

<template>
   <component 
      :is="props.link ? 'a' : 'button'"

      :class="[
         props.inClass,
         props.addedClass,
         props.isLoading ? 'cursor-not-allowed' : '',
         pressed ? `${props.customClickClass ? props.customClickClass : 'scale-90'}` : 'scale-100 hover:scale-105',
         'flex items-center justify-center disabled:saturate-0 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:bg-opacity-90 disabled:bg-gray-400 disabled:select-none w-max select-none transition-all relative overflow-hidden cursor-pointer leading-tight',
         props.disabledLink ? '!cursor-not-allowed !pointer-events-none !bg-gray-400' : '', 
      ]"

      :href="props.link"
      :target="props.linkNewTab ? '_blank' : '_self'"

      @click="handleClick"
   >

      <Transition name="tr-fade">
         <div
            v-if="props.isLoading"
            class="absolute inset-0 skeleton -z-20"
         />
      </Transition>

      <div v-if="props.hideContentWhileLoading" >
         <MintyIcon :icon="'eos-icons:three-dots-loading'" v-if="props?.isLoading" class="z-10 text-6xl" />
         <slot v-else />
      </div>

      <div class="contents" v-else>
         <slot />

         <MintyIcon :icon="'eos-icons:three-dots-loading'" v-if="props?.isLoading" class="z-10 ml-4 text-6xl" />
      </div>

   </component>
</template>

<style lang="scss" scoped>

@keyframes loading {
0% {
   background-position: 0% 0%;
}
100% {
   background-position: -200% 0%;
}
}

.skeleton {
   z-index: -10;

   background: linear-gradient(90deg, #909090 25%, #808080 50%, #909090 75%);
   background-size: 200% 100%;
   animation: loading 1s linear infinite;
}

</style>

