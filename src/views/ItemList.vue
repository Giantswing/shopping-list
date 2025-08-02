<script setup>
import shop from "@/stores/store";
const useShop = shop();
</script>

<template>
    <div class="w-full flex flex-col gap-2 items-center">
        <div v-for="i in 40">
            <span>Test {{ i }}</span>
        </div>

    </div>
</template>