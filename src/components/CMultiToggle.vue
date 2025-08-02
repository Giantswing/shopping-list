<template>
  <nav class="relative flex items-center transition-all duration-200"
    :class="`
      ${disabled ? 'saturate-0 pointer-events-none brightness-125 opacity-75' : ''}
    `"
  >
    <label v-if="title" class="absolute block w-full overflow-hidden text-sm font-bold text-center text-neutral-700 -top-5">{{ title }}</label>
    <div
      class="w-full grid grid-flow-col items-center font-bold rounded-lg relative h-[34px] md:h-[38px] cursor-pointer border-selector transition-all duration-200 ease-out"
      :class="`
        ${numberOfCols}
        ${isTransitioning ? 'scale-y-90 scale-x-105' : ''}
      `"
      :style="`background-color: ${inactiveColor};`"
    >
      <!-- This are the little sticks that divide the different options -->
      <span class="absolute flex justify-between w-full">
        <span
          v-for="index in options.length"
          :key="index"
          class="z-10 w-full text-center text-white scale-x-75 scale-y-150 translate-x-1/2 opacity-30 font-base last:invisible"
        >
          |
        </span>
      </span>
      <!-- This is the background span that moves around depending on the selected option -->
      <span
        :style="`${customWidthAndPos}; background-color: ${activeColor};`"
        class="w-[50%] h-[34px] md:h-[38px] absolute top-0 z-10 transform rounded-lg transition-all ease-in-out duration-200 px-10"
        :class="`
          ${isTransitioning ? 'scale-y-115 scale-x-125' : ''}
          ${currentValue == -1 ? 'hidden' : ''}
        `"
      ></span>
      <!-- This is the v-for with the actual options -->
      <a
        :href="links ? links[index] : '#'"
        v-for="(option, index) in options"
        :key="index"
        @click.prevent="
          () => {
            if (currentValue == index) return;
            // currentValue = index;
            restoreTransition();
            this.$emit('onToggle', index);
          }
        "
        class="relative z-20 px-4 text-sm md:text-base text-center transition duration-300 w-[100%] border-neutral-50 border-opacity-25 first:border-r-2 py-2 leading-none whitespace-nowrap overflow-hidden text-ellipsis"
        :style="`${currentValue == index ? 'color: white;' : `color: ${activeColor}`}`"
      >
        {{ $t(option) }}
      </a>
    </div>
  </nav>
</template>

<script>
export default {
  name: "MintyMultiToggle",
  data() {
    return {
      isTransitioning: false,
    };
  },
  props: {
    currentValue: {
      type: Number,
      required: true,
      default: 0,
    },
    options: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    links: {
      type: Array,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    activeColor: {
      type: String,
      required: false,
      default: "#009483",
    },
    inactiveColor: {
      type: String,
      required: false,
      default: "#CFEDE8",
    },
  },
  computed: {
    customWidthAndPos() {
      let totalOptions = this.options.length;
      let width = 100 / totalOptions;
      return `width: ${width}%; left: ${this.currentValue * width}%`;
    },
    numberOfCols() {
      return `grid-cols-${this.options.length}`;
    },
  },
  methods: {
    restoreTransition() {
      this.isTransitioning = true;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 150);
    },
  },
};
</script>
