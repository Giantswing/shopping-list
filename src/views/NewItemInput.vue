<script setup>
import shop from "@/stores/store";
const useShop = shop();
</script>

<template>
    <div
        class="w-full flex flex-col gap-2 items-center sticky top-0 bg-white z-20 p-1 shadow-sm pb-2"
    >
        <h2 class="text-xs font-semibold text-blue-600">{{ $t("new-buy-message") }}</h2>
        <input
            v-model="useShop.newItemInput"
            class="w-full border-b-2 border-gray-300 rounded-md focus:outline-none focus:border-gray-500 px-2 py-1"
        />

        <div v-if="useShop.newItemInput.length > 0" class="mt-2">
            <CButton :addedClass="'!bg-blue-600 text-sm !rounded-full !px-8'">
                <span>{{ $t("add-item") }}</span>
                <span class="font-bold">{{ useShop.newItemInput }}</span>
            </CButton>
        </div>
    </div>
</template>