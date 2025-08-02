<script setup>
/*
      <MintyInputBase
        :label="$t('registration.document-number')" 
        :customValidation="value => regStore().validateDocument(value, editGuest)"
        :value="editGuest.document"
        :dependsOn="editGuest.type_document"
        :errorArray="regStore().errorArray"
      >
        <MintyTextInput
          v-model="editGuest.document"
          :placeholder="$t('registration.document-number')"
          :maxLength="16"
        />
      </MintyInputBase>
*/


import { onMounted, onBeforeUnmount, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
   label: {
      type: String,
      required: false,
      default: null,
   },

   value: {
      required: false,
      default: null,
   },

   //This is an optional array of values that this input depends on
   //If any of these values change, the input will be revalidated
   //For example, the document number depends on the document type
   dependsOn: {
      type: Array,
      required: false,
      default: null,
   },

   //This function should return either true if it passes 
   //Or a string with the error message
   customValidation: {
      type: Function,
      required: false,
      default: null,
   },

   //This is the parent array that will contain all the errors
   //present in the form
   errorArray: {
      type: Array,
      required: false,
      default: null,
   },

   hideLabel: {
      type: Boolean,
      required: false,
      default: false,
   },

   required: {
      type: Boolean,
      required: false,
      default: true,
   },

   onHelpClick: {
      type: Function,
      required: false,
      default: null,
   },
});

const emit = defineEmits(['onFail', 'onSuccess']);

const inputParent = ref(null);
const input = ref(null);
const error = ref(null);
const checkCount = ref(0);


const unMounting = ref(false);

onMounted(() => {
   unMounting.value = false;
   checkCount.value = 0;

   input.value = inputParent.value.querySelectorAll('select, input, textarea, button, nav')?.[0];

   if (input.value) {
      input.value.setAttribute('name', props.label);
      input.value.setAttribute('id', props.label);

      setTimeout(() => {
         if (!unMounting.value) {
            validateValue();
         }
      }, 20);
   }
});

onBeforeUnmount(() => {
   unMounting.value = true;
   checkCount.value = 0;

   if(props.errorArray.includes(props.label)) {
      props.errorArray.splice(props.errorArray.indexOf(props.label), 1);
   }
});

watch(() => props.value, () => {
   validateValue();
});

watch(() => props.dependsOn, ( oldValue, newValue ) => {
   let oldValueString = JSON.stringify(oldValue);
   let newValueString = JSON.stringify(newValue);

   if (oldValueString !== newValueString) {
      validateValue();
   }
});

const increaseCheckCount = () => {
   checkCount.value++;
};

const validateValue = () => {
   if (props.customValidation) {
      error.value = null;

      increaseCheckCount();

      if(props.value != null && props.value != undefined && props.value != '' && props.value != 0) {
         increaseCheckCount();
      }

      let validationResult = props.customValidation(props.value);

      if (validationResult !== true && props.required) {
         error.value = validationResult;
         emit('onFail', props.label);

         if (!props.errorArray.includes(props.label)) {
            props.errorArray.push(props.label);
         }
      }
      else {
         emit('onSuccess', props.label);

         //If the error is already in the array, remove it
         if(props.errorArray.includes(props.label)) {
            props.errorArray.splice(props.errorArray.indexOf(props.label), 1);
         }
      }
   }
};
</script>

<template>
   <div
      class="flex flex-col z-10"
      ref="inputParent"
   >
      <label
         v-if="props.label && !props.hideLabel"
         class="md:text-sm font-semibold text-gray-600 text-ellipsis whitespace-nowrap relative block max-w-full md:mb-1"
         :for="label"
      >
         <span>{{ props.label }}</span>
         <span
            class="!font-base ml-2 text-gray-400 italic bg-gray-200 px-2 rounded-full"
            v-if="!props.required"
         >
            {{ $t('registration.not-mandatory') }}
         </span>

         <button
            v-if="props.onHelpClick"
            type="button"
            @click="props.onHelpClick"
         >
            <MintyIcon :icon="'line-md:question-circle-twotone'" class="text-mh-green opacity-50 hover:opacity-100 w-[22px] h-[22px] translate-y-[4px] ml-2" />
         </button>

      </label>

      <div class="z-10">
         <slot />
      </div>

      <MintySmoothHeight :showIf="error?.length > 0 && checkCount > 1">
         <div class="p-1 pt-3 bg-red-50 rounded-b-md flex gap-1 border-2 border-red-100 border-t-0 translate-y-[-5px] mb-[-10px] z-0">
            <MintyIcon
               :icon="'fe:warning'"
               class="text-red-500"
            />

            <p class="text-red-500 text-xs" >
               {{ error }}
            </p>
         </div>
      </MintySmoothHeight>
   </div>
</template>
