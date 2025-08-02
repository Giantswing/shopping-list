<script setup>
import shop from "@/stores/shop";
const useShop = shop();
</script>

<template>
    <div class="w-full flex flex-col-reverse gap-2 items-center ">
        <div v-for="i in 40">
            <span>Test {{ i }}</span>
        </div>
    </div>
</template>