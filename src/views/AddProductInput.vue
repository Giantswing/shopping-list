<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import fuzzysort from "fuzzysort";

import { basket } from "@/stores/basket";
const useBasket = basket();

const suggestions = computed(() => {
  const maxResults = 4;
  let result = Array.from(useBasket.products.values());

  if (!result || result.length === 0) {
    return [];
  }

  const alreadyAddedIds = Array.from(useBasket.products.values())
    .filter(p => p.is_added)
    .map(p => p.id);
  result = result.filter(p => !alreadyAddedIds.includes(p.id));

  const search = useBasket.newProductInput.toLowerCase();

  const daysSince = date => {
    if (!date) return 9999;
    const now = new Date();
    const then = new Date(date);
    return (now - then) / (1000 * 60 * 60 * 24);
  };

  // Route 1: fuzzy match if input has value
  if (search.length > 0) {
    let found = fuzzysort.go(search, result, {
      key: "name",
      threshold: 0.5,
      limit: 0
    });

    // Add scoring boosts (optional)
    found = found.map(item => {
      const timesAdded = item.obj.times_added || 0;
      const recencyPenalty = daysSince(item.obj.last_added_at || null) * 0.5;
      const boost = timesAdded * 5 - recencyPenalty;

      return {
        ...item,
        combinedScore: item.score - boost // lower = better in fuzzysort
      };
    });

    found.sort((a, b) => a.combinedScore - b.combinedScore);
    // Return array of objects with both product and score
    return found.slice(0, maxResults).map(item => ({
      ...item.obj,
      combinedScore: item.combinedScore
    }));
  }

  // Route 2: no input – fallback to top products
  result = result
    .map(p => {
      const freq = p.times_added || 0;
      const recency = daysSince(p.last_added_at || null);
      const score = freq * 5 - recency;
      return {
        ...p,
        combinedScore: score
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  return result.slice(0, maxResults);
});

const handleAddProduct = (product, comesFromSuggestion = false) => {
  if (!product || product.name.length === 0) {
    return;
  }

  useBasket.addProductToBasket(product.name);

  if (!comesFromSuggestion) {
    inputRef.value.focus();
  }
};

const inputRef = ref(null);

onMounted(() => {
  inputRef.value.addEventListener("keydown", handleInputKeydown);
});

onBeforeUnmount(() => {
  inputRef.value.removeEventListener("keydown", handleInputKeydown);
});

// Add onEnter handler for input
const handleInputKeydown = event => {
  if (event.key === "Enter") {
    // If there are suggestions, add the top suggestion
    if (suggestions.value.length > 0) {
      handleAddProduct(suggestions.value[0]);
    } else if (useBasket.newProductInput.length > 0) {
      // Otherwise, add as a new product
      handleAddProduct({ name: useBasket.newProductInput });
    }
  }
};

const cleanUpInput = () => {
  let result = useBasket.newProductInput;
  result = result.toLowerCase();

  /* replace spanish tildes */
  result = result.replace(/á/g, "a");
  result = result.replace(/é/g, "e");
  result = result.replace(/í/g, "i");
  result = result.replace(/ó/g, "o");
  result = result.replace(/ú/g, "u");

  /* remove any character that is not a-z, space */
  result = result.replace(/[^a-z ]/g, "");

  useBasket.newProductInput = result;
};

defineExpose({ handleInputKeydown }); // In case parent wants to use it
</script>

<template>
  <div
    class="w-full flex flex-col gap-2 items-center bg-white z-20 p-1 pb-2 rounded-t-2xl px-4 pt-2 relative shadow-[0_0_40px_rgba(0,0,0,0.05)]"
    v-auto-animate="{ duration: 100 }"
  >
    <!-- DELETE ALL ITEMS BUTTON -->
    <div class="w-full absolute flex flex-col -translate-y-full p-4 pb-5 gap-4 pointer-events-none">
      <CButton
        class="pointer-events-auto"
        :addedClass="'w-[48px] h-[48px] !bg-rose-400 !border-red-300 !p-0'"
        @onClick="useBasket.removeAllProductsFromBasket()"
        :loading="useBasket.loading.removeAllProductsFromBasket"
        :isDisabled="useBasket.offlineMode || Array.from(useBasket.products.values()).filter(p => p.is_added).length === 0"
        :safetyConfirmation="true"
        :safetyConfirmationIcon="true"
      >
        <CIcon :icon="'material-symbols:delete-sweep-outline-rounded'" class="w-[32px] h-[32px] text-white" />
      </CButton>
    </div>

    <!-- LIST VIEW -->
    <div
      v-if="useBasket.currentView === 'list'"
      class="w-full flex flex-col gap-2 items-center border-t-2 border-blue-100 pt-2 rounded-t-xl"
    >
      <div v-if="suggestions.length > 0" class="w-full flex flex-col gap-2 items-center">
        <h3 class="text-xs font-semibold text-blue-400 mt-[-25px] bg-white px-2 py-1 rounded-full">{{ $t("suggestions") }}</h3>
        <div v-for="suggestion in suggestions" :key="suggestion.id" class="flex flex-row gap-2 items-center w-full">
          <button
            class="text-sm text-blue-600 py-1 active:scale-[0.8] transition-all duration-100 active:delay-[-50ms] bg-blue-50 px-4 rounded-full w-[80%] mx-auto"
            @click="handleAddProduct(suggestion, true)"
          >
            <span class="font-bold">{{ suggestion.name }}</span>
          </button>
        </div>
      </div>

      <h2 class="text-xs font-semibold text-blue-600 mt-1">{{ $t("new-buy-message") }}</h2>
      <input
        @input="cleanUpInput"
        ref="inputRef"
        :placeholder="$t('add-item-placeholder')"
        autofocus
        maxlength="28"
        v-model="useBasket.newProductInput"
        class="w-full border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1 text-center"
      />
    </div>

    <div
      v-if="useBasket.currentView === 'list'"
      :class="[
        'transition-all duration-100 overflow-hidden flex gap-2 items-center',
        useBasket.newProductInput.length > 0 ? 'max-h-[100px] mt-2' : 'max-h-[0px]'
      ]"
    >
      <!-- If there are no suggestions and input is non-empty, show "new item" button with "new" icon -->
      <template v-if="suggestions?.length === 0 && useBasket.newProductInput.trim().length > 0">
        <CButton
          :buttonType="'primary'"
          :addedClass="
            '!bg-blue-600 text-sm !rounded-full !px-8 !py-2 disabled:opacity-50 disabled:saturate-0 disabled:cursor-not-allowed'
          "
          @onClick="handleAddProduct({ name: useBasket.newProductInput })"
          :isDisabled="Array.from(useBasket.products.values()).some(p => p.name === useBasket.newProductInput.trim())"
        >
          <CIcon :icon="'qlementine-icons:new-16'" class="h-6 w-6 shrink-0" />
          <p class="font-bold leading-none break-words text-center w-full whitespace-pre-line">
            {{ useBasket.newProductInput }}
          </p>
        </CButton>

        <span
          v-if="Array.from(useBasket.products.values()).some(p => p.name.trim() === useBasket.newProductInput.trim())"
          class="text-sm text-gray-500"
        >
          {{ $t("product-already-in-basket") }}
        </span>
      </template>
      <!-- If there are suggestions, show suggestion button(s) with default icon, and if input is not equal to first suggestion, show "new item" button with "new" icon -->
      <template v-else-if="suggestions?.length > 0 && useBasket.newProductInput.length > 0">
        <CButton
          v-if="useBasket.newProductInput.trim() !== suggestions?.[0]?.name.trim()"
          :buttonType="'secondary'"
          :isDisabled="
            !(
              useBasket.newProductInput.trim() !==
              suggestions?.find(s => s.name.trim() === useBasket.newProductInput.trim())?.name.trim()
            ) || Array.from(useBasket.products.values()).some(p => p.name.trim() === useBasket.newProductInput.trim())
          "
          :addedClass="'!bg-blue-600 text-sm !rounded-full !px-4 !py-2'"
          @onClick="handleAddProduct({ name: useBasket.newProductInput })"
        >
          <CIcon :icon="'ic:round-fiber-new'" class="h-6 w-6 shrink-0" />
          <p class="font-bold leading-none text-center w-full whitespace-pre-line">{{ useBasket.newProductInput }}</p>
        </CButton>

        <CButton
          v-for="(suggestion, idx) in suggestions.slice(0, 1)"
          :buttonType="'primary'"
          :key="suggestion.id"
          :addedClass="'!bg-blue-600 text-sm !rounded-full !px-4 !py-2'"
          @onClick="handleAddProduct(suggestion)"
        >
          <CIcon :icon="'qlementine-icons:new-16'" class="h-6 w-6 shrink-0" />
          <p class="font-bold leading-none break-words text-center w-full whitespace-pre-line">{{ suggestion.name }}</p>
        </CButton>
      </template>
    </div>

    <!-- GRID VIEW -->
    <div
      v-if="useBasket.currentView === 'grid'"
      class="w-full flex flex-col gap-2 items-center border-t-2 border-blue-100 pt-2 rounded-t-xl"
    >
      <h3 class="text-xs font-semibold text-blue-400 mt-[-25px] bg-white px-2 py-1 rounded-full">{{ $t("filters") }}</h3>

      <div class="w-full flex flex-row gap-2 items-center justify-center">
        <button
          v-for="(filter, idx) in [
            { key: true, label: $t('showing-added-only') },
            { key: false, label: $t('show-all-products') }
          ]"
          :key="filter.key"
          class="flex flex-row gap-2 items-center justify-center px-6 py-2 text-sm active:scale-[0.8] transition-all duration-100 font-semibold  rounded-md"
          :class="[
            useBasket.filters.showOnlyAdded === filter.key
              ? 'opacity-100 bg-blue-300 w-[40%] text-blue-900'
              : 'opacity-60 bg-gray-300 w-[35%] text-gray-700',
            idx === 0 ? 'rounded-l-[50px]' : 'rounded-r-[50px]'
          ]"
          @click="useBasket.filters.showOnlyAdded = filter.key"
        >
          <span class="whitespace-nowrap">{{ filter.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
