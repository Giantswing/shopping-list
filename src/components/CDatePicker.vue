<script setup>
import { defineProps } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import moment from "moment";
import { es } from 'date-fns/locale';

defineProps({
   range: {
      type: Boolean,
      default: false,
      required: false,
   },
   presetDates: {
      type: Array,
      default: [
         {
            label: "This week",
            value: [
               moment().startOf("week").add(1, "days").format("YYYY-MM-DD"),
               moment().endOf("week").add(1, "days").format("YYYY-MM-DD"),
            ],
         },
         {
            label: "Next week",
            value: [
               moment()
               .startOf("week")
               .add(1, "days")
               .add(7, "days")
               .format("YYYY-MM-DD"),
               moment()
               .endOf("week")
               .add(1, "days")
               .add(7, "days")
               .format("YYYY-MM-DD"),
            ],
         },
         {
            label: "This month",
            value: [
               moment().startOf("month").format("YYYY-MM-DD"),
               moment().endOf("month").format("YYYY-MM-DD"),
            ],
         },
      ],
      required: false,
   },
   showPresetDates: {
      type: Boolean,
      default: true,
      required: false,
   },
   disabled: {
      type: Boolean,
      default: false,
      required: false,
   },
   clearable: {
      type: Boolean,
      default: false,
      required: false,
   },
   textInput: {
      type: Boolean,
      default: true,
      required: false,
   },
   monthPicker: {
      type: Boolean,
      default: false,
      required: false,
   },
   format: {
      type: String,
      default: "dd/MM/yyyy",
      required: false,
   },
   formatLocale: {
      type: String,
      default: "en",
      required: false,
   },
   disabledDates: {
      type: Array,
      default: () => [],
      required: false,
   },
   minDate: {
      type: String,
      default: null,
      required: false,
   },
   maxDate: {
      type: String,
      default: null,
      required: false,
   },
   inClass: {
      type: String,
      default: "",
      required: false,
   },
   modelType: {
      type: String,
      default: "yyyy-MM-dd",
      required: false,
   },
   autoApply: {
      type: Boolean,
      default: true,
      required: false,
   },
});
</script>

<template>
      <VueDatePicker
         :range="range"
         :format="format"
         :model-type="modelType"
         :text-input="textInput"
         class="mt-1"
         :teleport="true"
         :format-locale="formatLocale == 'es' ? es : null"
         :input-class-name="`font-semibold border-2 border-blue-active hover:border-blue-secondary text-gray-800 rounded-md h-[38px] disabled:bg-gray-200 disabled:text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed ${inClass}`"
         menu-class-name="shadow-md rounded-lg animation-calendar-enter"
         calendar-cell-class-name="rounded-md"
         :enable-time-picker="false"
         :clearable="clearable"
         :disabled="disabled"
         :preset-dates="showPresetDates ? presetDates : []"
         :month-picker="monthPicker"
         :disabled-dates="disabledDates"
         :min-date="minDate"
         :max-date="maxDate"
         @update:model-value="($event) => $emit('onUpdate', $event)"
         :auto-apply="autoApply"

         :ui="{
            menu: 'custom-date-menu',
         }"
      >
         <template
            v-if="presetDates && showPresetDates"
            #preset-date-range-button="{ label, value, presetDate }"
         >
            <span
               role="button"
               :tabindex="0"
               @click="presetDate(value)"
               @keyup.enter.prevent="presetDate(value)"
               @keyup.space.prevent="presetDate(value)"
            >
               {{ label }}
            </span>
         </template>
      </VueDatePicker>
</template>

<style lang="postcss">
.translate-enter-active,
.translate-leave-active {
   transition: all 0.1s ease;
}

.translate-enter-from,
.translate-leave-to {
   opacity: 0;
   transform: translateY(-30px);
}

@keyframes appear {
   0% {
      opacity: 0;
   }
   100% {
      opacity: 1;
   }
}

.dp__input {
   @apply !border-2 !border-mh-green !rounded-md !pr-1 !font-[Poppins];
}

.dp--overlay-relative {
   @apply !h-fit py-4;
}

.custom-date-menu {
   --dp-menu-border-color: #aaa;
   @apply !rounded-xl !border-2 !border-mh-green scale-[105%];
}

.custom-date-menu .dp__arrow_top {
   border-inline-end: 2px solid #009483 !important;
   border-top: 2px solid #009483 !important;
   top: -2px !important;
}

.dp__selection_preview {
   display: none !important;
}

.dp__action_cancel {
   display: none !important;
}

.dp__action_buttons {
   width: 100% !important;
   display: flex !important;
   justify-content: center !important;
   margin-left: auto !important;
   margin-right: auto !important;

}

.dp__action_select {
   @apply !font-bold !bg-mh-green !px-3 !py-1 !fluid-lg hover:!brightness-125 !h-fit !mt-[-5px];

}

.dp--overlay-relative {
   @apply !h-fit !pt-4;
}

.dp__time_display {
   @apply !text-mh-black !fluid-xl;
}
.dp__tp_inline_btn_bar, dp__tp_btn_in_l {
   @apply !bg-mh-green !h-[6px];
}


.dp__active_date {
   background-color: #009483 !important;
}

.dp__overlay_cell_active {
   background-color: #009483 !important;
}

.dp__today {
   @apply !border-2 !border-mh-green;

}
.dp__overlay {
   @apply !rounded-2xl !overflow-hidden;

}

</style>

