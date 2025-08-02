<script setup>
import { computed } from "vue";

import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  colorDictionary: {
    type: String,
    default: "",
    required: false,
  },
  selected: {
    type: Object,
    default: {},
    required: false,
  },
  showIf: {
    type: Boolean,
    default: true,
    required: false,
  },
  options: {
    type: Array,
    default: [],
    required: false,
  },
  label: {
    type: String,
    default: "",
    required: false,
  },
  inlineClass: {
    type: String,
    default: "",
    required: false,
  },
  placeholder: {
    type: String,
    default: "",
    required: false,
  },
  multiple: {
    type: Boolean,
    default: false,
    required: false,
  },
  appendToBody: {
    type: Boolean,
    default: false,
    required: false,
  },
  searchable: {
    type: Boolean,
    default: true,
    required: false,
  },
  small: {
    type: Boolean,
    default: false,
    required: false,
  },
  closeOnSelect: {
    type: Boolean,
    default: true,
    required: false,
  },
  usesTaskStatusColors: {
    type: Boolean,
    default: false,
    required: false,
  },
  usesCommStatusColors: {
    type: Boolean,
    default: false,
    required: false,
  },
  clearable: {
    type: Boolean,
    default: true,
    required: false,
  },
  reduceOnId: {
    type: Boolean,
    default: false,
    required: false,
  },
  reduceOnCustom: {
    type: String,
    default: "",
    required: false,
  },
  bannedIds: {
    type: Array,
    default: [],
    required: false,
  },
  translationRoot: {
    type: String,
    default: "",
    required: false,
  },
  clearSearchOnSelect: {
    type: Boolean,
    default: true,
    required: false,
  },
  loadingIf: {
    type: Boolean,
    default: false,
    required: false,
  },
  maxDropdownHeight: {
    type: String,
    default: "250px",
    required: false,
  },
  ignoreTranslation: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const colorMap = {
  taskStatuses: {
    1: "red", // Pending
    2: "lightGray", // Pre-assigned
    3: "blue", // Assigned
    4: "darkGray", // Cancelled
    13: "green", // Completed
    14: "purple", // Ready for bid
    17: "lightBlue", // Self check-in
    19: "lightOrange",
    20: "lightOrange",
  },
  bookingChannels: {
    noValue: "lightGray", // N/D
    0: "red", // No whatsapp
    1: "green", // Whatsapp
  },
  bookingStatuses: {
    CONFIRMED: "green",
    CANCELLED: "red",
    MANUAL: "lightGray",
    UNAVAILABLE: "darkGray",
  },
};


const inputColorMap = {
  taskStatuses: {
    noValue: "rgba(255,255,255,1)",
    1: "rgba(255,0,0,0.2)", // Pending
    2: "rgba(128,128,128,0.5)", // Pre-assigned
    3: "rgba(59, 130, 246, 0.3)", // Assigned
    4: "rgba(128,128,128,0.6)", // Cancelled
    13: "rgba(22,163,74,0.3)", // Completed
    14: "rgba(153,51,255,0.3)", // Self check-in
    17: "rgba(53,151,255,0.3)", // Ready for bid
    19: "rgba(170,100,70,0.3)", // Ongoing
    20: "rgba(170,100,70,0.3)", // Ongoing
  },
  bookingStatuses: {
    noValue: "rgba(255,255,255,1)",
    CONFIRMED: "rgba(22,163,74,0.3)",
    CANCELLED: "rgba(255,0,0,0.2)",
    MANUAL: "rgba(185,185,185,0.5)",
    UNAVAILABLE: "rgba(128,128,128,0.5)",
  },
  bookingChannels: {
    noValue: "rgba(128,128,128,0.5)", // N/D
    0: "rgba(255,0,0,0.2)", // No whatsapp
    1: "rgba(22,163,74,0.3)", // Whatsapp
  },
};


const computeColor = computed(() => {
  if (props.colorDictionary == "") return;
  let computedColorMap = inputColorMap[props.colorDictionary];

  if (props.selected == null) return computedColorMap["noValue"];

  let computedSelected;
  if (props.selected.id != null) computedSelected = props.selected.id;
  else if (props.selected.value != null) computedSelected = props.selected.value;
  else computedSelected = props.selected;

  return computedColorMap[computedSelected];
});


//METHODS

const setMaxHeight = () => {
  var inputs = document.getElementsByClassName("vs__dropdown-menu");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].style.maxHeight = props.maxDropdownHeight;
  }
};


const addColor = () => {
  if (props.colorDictionary != "") {
    var dropDowns = document.getElementsByClassName("vs__dropdown-option");

    for (var i = 0; i < dropDowns.length; i++) {
      let computedColorMap = colorMap[props.colorDictionary];

      let computedInput;
      computedInput = props.options[i].id;
      if (computedInput == null) computedInput = props.options[i].value;
      if (computedInput == null) computedInput = props.options[i];

      if (computedInput == null) {
        dropDowns[i].setAttribute("customColor", computedColorMap["noValue"]);
      } else {
        dropDowns[i].setAttribute("customColor", computedColorMap[computedInput]);
      }
    }
  } else {
    var inputs = document.getElementsByClassName("vs__dropdown-menu");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].classList.add("no-color");
    }
  }
};

</script>

<template>
  <VueSelect
  ref="vueSelect"
  v-if="showIf && options?.length > 0 && !loadingIf"
  class="style-chooser"
  :disabled="isDisabled"

  :class="[
    props.inlineClass,
    props.multiple ? 'isMultiple' : '',
    props.small ? 'small' : '',
    props.colorDictionary != '' ? 'use-color rounded-lg' : '',
    props.isDisabled ? 'disable-input !pointer-events-none !cursor-not-allowed opacity-70' : '',
  ]"

  :style="[
    props.colorDictionary != '' ? `background-color:${computeColor}` : '',
  ]"


  :appendToBody="appendToBody"
  :options="options"
  :get-option-label="label != '' ? option => ignoreTranslation ? option[label] : $t(translationRoot + option[label]) : option => ignoreTranslation ? option : $t(translationRoot + option)"
  :placeholder="placeholder ? placeholder : '-/-'"
  :searchable="searchable"
  :selectable="option => !bannedIds.includes(option.id)"
  :multiple="multiple"
  :closeOnSelect="closeOnSelect"
  :deselectFromDropdown="!closeOnSelect"
  :clearable="clearable"
  :reduce="reduceOnCustom != '' ? option => option[reduceOnCustom] : reduceOnId ? option => option.id : undefined"
  :clearSearchOnSelect="clearSearchOnSelect"

  @option:selected="$event => $emit('selected', $event)"

  @input="$event => $emit('input', $event)"

  @open="
  () => {
    $nextTick(() => {
      addColor();
      setMaxHeight();
    });
  }
  "
/>

  <div
    v-else-if="showIf"
    class="relative flex items-center justify-center w-full overflow-hidden border-2 border-gray-400 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"
    :class="[
      small == false ? 'h-[38px]' : 'h-[32px]',
    ]"
  >
    <MintyIcon :icon="'eos-icons:three-dots-loading'" class="z-50 p-2 text-blue-active text-6xl" />
    <div class="slide-motion"/>
  </div>

  <div
    v-else
    class="relative flex items-center justify-center w-full overflow-hidden border-2 border-gray-400 rounded-md bg-gradient-to-r from-gray-100 to-gray-200"
    :class="[
      small == false ? 'h-[38px]' : 'h-[32px]',
    ]"
  >

    <MintyIcon :icon="'heroicons-solid:exclamation'" class="z-50 p-2 text-gray-500 text-6xl" />
    <p class="font-semibold text-sm text-gray-600">
      {{ $t("book-multi.search-no-results") }}
    </p>
  </div>

</template>


<style>
.vs__dropdown-toggle {
  @apply !border-2 !border-mh-green !rounded-md;
}

.vs__dropdown-option--highlight {
  @apply !bg-mh-green-light !text-mh-green;
}

.vs__search {
  @apply !text-gray-400 fluid-sm md:!fluid-base;
}
</style>

