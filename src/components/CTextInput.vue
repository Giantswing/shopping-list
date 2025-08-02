<script setup>
import { toRefs, ref } from 'vue';

const props = defineProps({
  modelValue: {
    default: "",
    required: true,
  },
  type: {
    default: "text",
    required: false,
  },
  inlineClass: {
    default: "",
    required: false,
  },
  placeholder: {
    type: String,
    default: "",
    required: false,
  },
  small: {
    type: Boolean,
    default: false,
    required: false,
  },
  suffix: {
    type: String,
    default: "",
    required: false,
  },
  showSuffix: {
    type: Boolean,
    default: false,
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  updateOnBlurOnly: {
    type: Boolean,
    default: true,
  },
  isLink: {
    type: Boolean,
    default: false,
  },
  smallText: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: -1,
  }
});

const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue', 'onBlur']);


const openLink = () => {
   window.open(modelValue.value, '_blank');
}

const detectLink = () => {
   if(modelValue.value && modelValue.value.includes('http')) {
      return true;
   }
   return false;
}


const focused = ref(false);

</script>

<template>
   <div class="relative group">
      <input
         :type="type"
         class="w-full text-gray-800 border-2 rounded-md border-blue-active !p-1.5 !pl-2.5 placeholder:text-gray-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-500 relative"
         :placeholder="placeholder ? placeholder : '-/-'"
         :value="modelValue"
         @input="(e) => {
            if(updateOnBlurOnly) return;
            emit('update:modelValue', e.target.value);
         }"
         @focus="focused = true"
         @blur="(e) => {
            focused = false; 
            $emit('onBlur')

            if(!updateOnBlurOnly) return;
            emit('update:modelValue', e.target.value);
         }"
         :disabled="disabled"
         :maxlength="maxLength"
      />

      <div 
         v-if="suffix != null && suffix != ''"
         class="absolute inset-y-0 flex items-center pr-2 group-hover:right-6 transition-all duration-200"
         :class="`${showSuffix ? 'right-12 opacity-100' : 'opacity-0 right-1'} ${focused ? 'right-6' : 'right-1'} `"
      >
         <span class="text-base font-bold text-gray-500">{{ suffix }}</span>
      </div>

      <button 
         v-if="isLink"
         @click="openLink"
         class="absolute right-[3px] top-1/2 -translate-y-1/2 transition-all duration-100 hover:bg-blue-secondary hover:!scale-100 px-2 py-1 bg-blue-active rounded-[4px] dont-disable z-20"
         :disabled="!detectLink()"
      >
        <MintyIcon :icon="'fas:external-link-alt'" class="text-white" />
      </button>


   </div>
</template>

