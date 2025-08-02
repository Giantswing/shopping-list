<script setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import { computed, ref, onMounted } from "vue"

import moment from "moment";
import { es } from 'date-fns/locale';

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
   range: {
      type: Boolean,
      default: false,
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
   formatLocale: {
      type: String,
      default: "en",
      required: false,
   },
   placeholder: {
      type: String,
      default: "HH:MM",
      required: false,
   },
   timeFormat: {
      type: String,
      default: "24h",
      required: false,
      validator(value) {
         return ["24h", "12h"].includes(value);
      },
   },
   timeRange: {
      type: String,
      default: "",
      required: false,
   },

   currentValue: {
      type: String,
   },
});

const updateColorOpen = (e) => {
   if (props.currentValue) {
      timeColor.value = updateTimeColor(props.currentValue);
   } else {
      timeColor.value = updateTimeColor(moment().format("HH:mm"));
   }
};

const computedFormat = computed(() => {
   return props.timeFormat == "12h" ? "hh:mm a" : "HH:mm";
});

const computedPlaceholder = computed(() => {
   return props.timeFormat == "12h" ? "03:00 PM" : "15:00";
});

const handleTimeChange = (time) => {
   let formattedTime = time;
   if (props.timeFormat == "12h") {
      formattedTime = moment(time, "hh:mm a").format("HH:mm");
   } else {
      formattedTime = moment(time, "HH:mm").format("HH:mm");
   }

   // Round the time to intervals of 5 minutes
   const minutes = moment(formattedTime, "HH:mm").minutes();
   const roundedMinutes = Math.round(minutes / 5) * 5;
   formattedTime = moment(formattedTime, "HH:mm").minutes(roundedMinutes).format("HH:mm");

   timeColor.value = updateTimeColor(formattedTime);

   emit("update:modelValue", formattedTime);
};

// const roundedMinutes = (minutes) => {
//    return Math.round(minutes / 5) * 5;
// };

const roundedMinutes = (minutes) => {
   let value = Math.round(minutes / 5) * 5;
   return moment(value, "mm").format("mm");
};

const timeColor = ref("#009483");

const interpolateColor = (color1, color2, factor) => {
   const hsl1 = color1.match(/\d+/g).map(Number); // Extract HSL values
   const hsl2 = color2.match(/\d+/g).map(Number);
   
   const h = hsl1[0] + (hsl2[0] - hsl1[0]) * factor;
   const s = hsl1[1] + (hsl2[1] - hsl1[1]) * factor;
   const l = hsl1[2] + (hsl2[2] - hsl1[2]) * factor;

   return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
};

const lightenColor = (hslColor, amount, saturation = 100) => {
   if(!hslColor.match(/hsl\(\d+,\s*\d+%,\s*\d+%\)/)) {
      return hslColor;
   }

   const hslParts = hslColor.match(/\d+/g).map(Number);
   let [h, s, l] = hslParts;

   s = hslParts[1] * saturation / 100;
   l = Math.min(70, l + amount);

   return `hsl(${h}, ${s}%, ${l}%)`;
};

const updateTimeColor = (time) => {
   const hour = moment(time, "HH:mm").hour();

   const colorStops = [
      { hour: 0, color: "hsl(230, 50%, 10%)" },
      { hour: 1, color: "hsl(235, 48%, 12%)" },
      { hour: 2, color: "hsl(238, 46%, 14%)" },
      { hour: 3, color: "hsl(240, 45%, 16%)" },
      { hour: 4, color: "hsl(245, 44%, 18%)" },
      { hour: 5, color: "hsl(250, 42%, 22%)" },
      { hour: 6, color: "hsl(260, 40%, 30%)" },
      { hour: 7, color: "hsl(35, 85%, 55%)" },
      { hour: 8, color: "hsl(45, 90%, 60%)" },
      { hour: 9, color: "hsl(50, 90%, 65%)" },
      { hour: 10, color: "hsl(55, 88%, 68%)" },
      { hour: 11, color: "hsl(55, 88%, 68%)" },
      { hour: 12, color: "hsl(200, 70%, 65%)" },
      { hour: 13, color: "hsl(210, 75%, 72%)" },
      { hour: 14, color: "hsl(215, 80%, 78%)" },
      { hour: 15, color: "hsl(220, 85%, 80%)" },
      { hour: 16, color: "hsl(225, 90%, 78%)" },
      { hour: 17, color: "hsl(40, 85%, 55%)" },
      { hour: 18, color: "hsl(30, 80%, 50%)" },
      { hour: 19, color: "hsl(25, 75%, 45%)" },
      { hour: 20, color: "hsl(20, 65%, 35%)" },
      { hour: 21, color: "hsl(220, 60%, 30%)" },
      { hour: 22, color: "hsl(225, 55%, 22%)" },
      { hour: 23, color: "hsl(230, 50%, 15%)" }
   ];

   let lowerStop = colorStops[0];
   let upperStop = colorStops[colorStops.length - 1];

   for (let i = 0; i < colorStops.length - 1; i++) {
      if (hour >= colorStops[i].hour && hour < colorStops[i + 1].hour) {
         lowerStop = colorStops[i];
         upperStop = colorStops[i + 1];
         break;
      }
   }

   const factor = (hour - lowerStop.hour) / (upperStop.hour - lowerStop.hour);
   const interpolatedColor = interpolateColor(lowerStop.color, upperStop.color, factor);
   
   const lighterColor = lightenColor(interpolatedColor, 35, 70);

   timeColor.value = interpolatedColor;

   // if(props?.timeRange?.length > 0) {
   //    if(['early', 'late'].includes(props.timeRange)) {
   //       document.documentElement.style.setProperty("--time-bg-back", "orange");
   //    }
   //    else if (props.timeRange == 'very-early') {
   //       document.documentElement.style.setProperty("--time-bg-back", "red");
   //    }
   //
   //    document.documentElement.style.setProperty("--time-bg-back", "white");
   // }

   document.documentElement.style.setProperty("--time-bg-color", interpolatedColor);
   document.documentElement.style.setProperty("--time-bg-light", lighterColor);

   return interpolatedColor;
};
</script>

<template>

   <VueDatePicker
      :range="false"

      :format="computedFormat"
      :model-type="'HH:mm'"

      :text-input="true"
      :teleport="true"
      :format-locale="formatLocale == 'es' ? es : null"
      :enable-time-picker="true"
      :clearable="clearable"
      :disabled="disabled"
      :month-picker="false"

      @update:model-value="handleTimeChange"

      :time-picker-inline="true"
      :minutes-increment="5"
      :no-hours-overlay="true"
      :no-minutes-overlay="true"
      :time-picker="true"
      :is-24="timeFormat == '24h'"

      @open="(e) => {
         updateColorOpen(e);
      }"

      :placeholder="computedPlaceholder"

      :ui="{
         menu: 'custom-time-menu',
      }"

      auto-apply
   >
      <template #am-pm-button="{ toggle, value }">
         <div class="flex flex-col justify-center items-center">
            <button
               @click="toggle"
               :class="[
                  'ml-4 mr-2 rounded-full border-2 p-4 py-2 text-xl transition-all duration-500 shadow-inner shadow-gray-700 overflow-hidden active:scale-50 active:delay-[-250ms] z-10',
               ]"
               :style="{
                  backgroundColor: lightenColor(timeColor, 50),
                  color: 'white',
               }"
            >
               <Transition name="tr-translate-left" mode="out-in">
                  <div v-if="value == 'AM'" class="flex flex-col">
                     <span class="font-semibold text-shadow-sm shadow-gray-700 uppercase">am</span>
                  </div>

                  <div v-else class="flex flex-col">
                     <span class="font-semibold text-shadow-sm shadow-gray-700 uppercase">pm</span>
                  </div>
               </Transition>
            </button>

            <div
               v-if="props.timeRange?.length > 0"
               class="overflow-hidden transition-all duration-500 translate-x-1 font-bold leading-none text-center max-w-[80px] uppercase text-xs py-1 px-2 rounded-full bg-orange-200 shadow-inner shadow-gray-500 outline outline-2 outline-white"
               :class="[
                  props.timeRange == 'normal' ? 'max-h-0 opacity-0 mt-[-5px]' : 'max-h-[50px] opacity-100 mt-1',
                  props.timeRange == 'very-early' ? 'text-white bg-red-700' : '',
                  ['early', 'late'].includes(props.timeRange) ? 'bg-orange-500 text-orange-50' : '',
               ]"
            >
               <span>{{ $t('registration.clock-range-' + props.timeRange) }}</span>
            </div>

         </div>
      </template>

      <template #tp-inline-arrow-up>
         <MintyIcon :icon="'hugeicons:arrow-up-01'" class="h-[32px] w-[32px] scale-x-125 mx-auto text-gray-500 active:scale-75 transition-all duration-100 active:delay-[-50ms]" />
      </template>

      <template #tp-inline-arrow-down>
         <MintyIcon :icon="'hugeicons:arrow-up-01'" class="h-[32px] w-[32px] scale-x-125 mx-auto text-gray-500 rotate-180 active:scale-75 transition-all duration-100 active:delay-[-50ms]" />
      </template>

      <template #hours="{ text, value }">
         <span class="text-4xl my-2 text-gray-800">{{ moment(value, 'h').format('HH') }}</span>
      </template>

      <template #minutes="{ text, value }">
         <span class="text-4xl my-2 text-gray-800">{{ roundedMinutes(value) }}</span>
      </template>


   </VueDatePicker>

</template>

<style lang="postcss">
.dp__input {
   @apply !border-2 !border-mh-green !rounded-md !pr-1 !font-[Poppins];
}

.dp--overlay-relative {
   @apply !h-fit py-4;
}

.custom-time-menu {
   --dp-menu-border-color: #aaa;
   @apply !rounded-3xl !border-2 !border-gray-500 outline outline-4 outline-white shadow-xl transition-all duration-1000 relative !scale-[120%] translate-x-[8%];

   background: var(--time-bg-light) !important;
}

.custom-time-menu::before {
   @apply !rounded-3xl;
   content: "";
   position: absolute;
   inset: 0;
   /* background: linear-gradient(to bottom, var(--time-bg-back), 90%, transparent); */
   background: linear-gradient(to bottom, white, 90%, transparent);
   transition: background 0.5s ease-in-out; /* Smooth transition */
   z-index: -1; /* Ensure it's behind content */
}

i.custom-time-menu .dp__selection_preview {
   display: none !important;
}

.custom-time-menu .dp__action_cancel {
   display: none !important;
}

.custom-time-menu .dp__action_buttons {
   width: 100% !important;
   display: flex !important;
   justify-content: center !important;
   margin-left: auto !important;
   margin-right: auto !important;

}

.custom-time-menu .dp__arrow_top {
   border-inline-end: 2px solid #777 !important;
   border-top: 2px solid #777 !important;
   top: -2px !important;
}

.custom-time-menu .dp__action_select {
   @apply !font-bold !bg-mh-green !px-3 !py-1 !fluid-lg hover:!brightness-125 !h-fit !mt-[-5px];
}

.custom-time-menu .dp--overlay-relative {
   @apply !h-fit !pt-4;
}

.custom-time-menu .dp__time_display {
   @apply !text-mh-black !fluid-xl;
}
.dp__tp_inline_btn_bar, dp__tp_btn_in_l {
   @apply !bg-mh-green !h-[24px];
}


.dp__inc_dec_button_inline {
   @apply scale-x-125 scale-y-150;
}

.dp__time_col_reg_with_button {
   padding: 6px !important;
   color: white !important;
   @apply scale-[105%]
}


.dp__pm_am_button {
   @apply ml-4 font-bold;
   background-color: #009483 !important;

}

.dp__time_display_inline {
   color: red !important;
}

.dp--time-overlay-btn {
   font-size: 30px !important;
   color: red !important;
}

</style>
