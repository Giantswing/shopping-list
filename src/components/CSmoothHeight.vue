<script setup>
defineProps({
   showIf: {
      required: true,
   },
   inClass: String,
   multiple: {
      type: Boolean,
      default: false
   },
   speed: {
      type: String,
      default: "0.15s"
   },
   ease: {
      type: String,
      default: "ease"
   }
});


const enter = element => {
   const height = getComputedStyle(element).height;

   element.style.visibility = null;
   element.style.height = 0;

   getComputedStyle(element).height;

   requestAnimationFrame(() => {
   element.style.height = height;
      // element.style.height = Math.round(parseFloat(height)) + "px";
   });
};

const afterEnter = element => {
   element.style.height = "auto";
};

const leave = element => {
   const height = getComputedStyle(element).height;

   element.style.height = height;

   // Force repaint to make sure the
   // animation is triggered correctly.
   getComputedStyle(element).height;

   requestAnimationFrame(() => {
      element.style.height = 0;
   });
};

</script>

<template>
   <Transition 
      v-if="multiple == false" 
      name="expand" 
      @enter="enter" 
      @after-enter="afterEnter" @leave="leave"
      :style="{ transition: `all ${speed} ${ease}` }"
   >
      <slot v-if="showIf == true" :class="`${inClass}`">
      </slot>
   </Transition>

   <Transition v-if="multiple == true" mode="out-in" name="expand" @enter="enter" @after-enter="afterEnter" @leave="leave">
      <slot name="first-item" v-if="showIf == true" :class="`${inClass}`">
      </slot>
      <slot name="second-item" v-else :class="`${inClass}`">
      </slot>
   </Transition>
</template>


<style scoped>
/* Dynamic height adjustment */
.expand-enter-active,
.expand-leave-active {
   overflow: hidden;
}

.expand-enter,
.expand-leave-to {
      height: 0;
      opacity: 0;
}

/* This is to improve performance, don't remove */
* {
   will-change: height;
   backface-visibility: hidden;
}
</style>

