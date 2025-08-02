<script setup>
import NewItemInput from "@/views/NewItemInput.vue";
import ItemList from "@/views/ItemList.vue";
</script>

<template>
    <div class="w-full flex flex-col items-center px-4 max-h-screen overflow-y-auto relative">
        <ItemList />
        <NewItemInput />
    </div>
</template>
