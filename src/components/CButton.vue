<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false
  },

  isLoading: {
    type: Boolean,
    default: false
  },

  safetyConfirmation: {
    type: Boolean,
    default: false
  },

  safetyConfirmationColor: {
    type: String,
    default: "#e28743"
  },

  safetyConfirmationIcon: {
    type: Boolean,
    default: false
  },

  safetyConfirmationTimeout: {
    type: Number,
    default: 8000
  },

  addedClass: {
    type: String,
    default: ""
  },

  link: {
    type: String,
    default: ""
  },

  backgroundColor: {
    type: String,
    default: "#262D63"
  },

  delayToBeClickableAgain: {
    type: Number,
    default: 300
  },

  buttonType: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["onClick"]);

const canClick = ref(true);
const confirmationState = ref(0);
const delayToBeClickableAgain = ref(props.delayToBeClickableAgain);
const safetyConfirmationTimer = ref(null);
const delayToBeClickableAgainTimer = ref(null);

onMounted(() => {
  if (props.safetyConfirmation) {
    delayToBeClickableAgain.value = 700;
  }
});

function handleClick() {
  /* Early returns */
  if (props.isDisabled) return;
  if (props.isLoading) return;
  if (!canClick.value) return;

  /* Delay to be clickable again */
  if (delayToBeClickableAgain.value > 0) {
    canClick.value = false;
    delayToBeClickableAgainTimer.value = setTimeout(() => {
      canClick.value = true;
    }, delayToBeClickableAgain.value);
  }

  /* Safety confirmation */
  if (props.safetyConfirmation) {
    confirmationState.value++;

    if (confirmationState.value >= 2) {
      confirmationState.value = 0;
      if (safetyConfirmationTimer.value) {
        clearTimeout(safetyConfirmationTimer.value);
      }
    } else {
      if (safetyConfirmationTimer.value) {
        clearTimeout(safetyConfirmationTimer.value);
      }

      safetyConfirmationTimer.value = setTimeout(() => {
        confirmationState.value = 0;
      }, props.safetyConfirmationTimeout);

      return;
    }
  }

  emit("onClick");
}

onUnmounted(() => {
  if (safetyConfirmationTimer.value) {
    clearTimeout(safetyConfirmationTimer.value);
  }

  if (delayToBeClickableAgainTimer.value) {
    clearTimeout(delayToBeClickableAgainTimer.value);
  }
});
</script>

<template>
  <Component
    :is="link ? 'a' : 'button'"
    :to="link"
    :disabled="isDisabled"
    :class="[
      'px-6 py-1 transition-all duration-100 relative text-white whitespace-nowrap rounded-full overflow-hidden select-none group/button hover:brightness-[1.25] hover:saturate-[1.25] active:scale-x-[1.05] active:delay-[-50ms] hover:shadow-sm border-2',

      buttonType == 'primary' ? '!bg-blue-500 border-blue-800' : '',
      buttonType == 'secondary' ? '!bg-transparent !text-gray-800 !border-gray-800' : '',

      canClick && !isLoading ? 'cursor-pointer' : 'cursor-auto',
      isLoading ? '!cursor-not-allowed' : '',
      isDisabled ? 'opacity-50 saturate-0 pointer-events-none' : '',
      addedClass
    ]"
    :style="`background-color: ${backgroundColor}`"
    @click.prevent="handleClick"
  >
    <!-- Loading effect -->
    <Transition name="tr-fade"> <div v-if="props.isLoading" class="absolute inset-0 skeleton" /> </Transition>

    <!-- Safety confirmation -->
    <div
      :class="[
        confirmationState === 1 ? 'translate-x-0' : 'translate-x-[-120%]',
        'absolute inset-0 left-[-35px] right-[-35px] flex items-center justify-center z-50 transition-all duration-[600ms] ease-elastic pointer-events-none text-shadow-sm shadow-black/50 rounded-xl'
      ]"
      :style="`background-color: ${props.safetyConfirmationColor}`"
    >
      <p
        class="text-white text-center text-sm font-bold group-hover/button:brightness-[0.8] transition-all"
        v-if="!safetyConfirmationIcon"
      >
        {{ $t("are-you-sure") }}
      </p>

      <CIcon v-else :icon="'mingcute:finger-press-fill'" class="w-[32px] h-[32px] text-white" />
    </div>

    <div class="group-active/button:scale-[0.6] group-active/button:delay-[-100ms] transition-all">
      <div class="relative z-10 grid grid-cols-1 grid-rows-1">
        <div
          class="col-start-1 row-start-1 flex items-center justify-center"
          :class="[props.isLoading ? 'opacity-100' : 'opacity-0']"
        >
          <CIcon :icon="'svg-spinners:3-dots-scale-middle'" class="w-[10px] h-[10px] scale-[3.0]" />
        </div>

        <div
          class="col-start-1 row-start-1 group-hover/button:brightness-[0.8] transition-all flex justify-center items-center gap-x-2"
          :class="[isLoading || confirmationState === 1 ? 'opacity-0' : 'opacity-100']"
        >
          <slot />
        </div>
      </div>
    </div>
  </Component>
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
  background: linear-gradient(90deg, #909090 25%, #808080 50%, #909090 75%);
  background-size: 200% 100%;
  animation: loading 1s linear infinite;
}
</style>
