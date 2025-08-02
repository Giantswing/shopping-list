<script setup>
import { watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const props = defineProps({
   /*
   Example prop:
   :values="[
   {
      key: 'nameInTheUrl',
      mode: 'url' //can also be local for local storage
      default: 'testName',
      value: testStore().testValue,
      change: (newValue) => testStore().testValue = newValue,
   },
   ]"
   */

   values: {
      type: Array,
      default: () => [],
      required: true,
   },

   localStoragePrefix: {
      type: String,
      default: "local_",
      required: false,
   },
});

onMounted(() => {
   handleUrlSavedData("load");
});

// Watch URL for changes
watch(() => route.params, async(newValue) => {
   setTimeout(() => {
      handleUrlSavedData("load");
   }, 100);
});

watch(() => props.values, async() => {
   setTimeout(() => {
      handleUrlSavedData("save");
   }, 100);
}, { deep: true });


const handleUrlSavedData = (mode = "save") => {
   if(mode == "save") {

      //Url saving
      let savedDataUrl = {};

      props.values.forEach((item) => {
         if(item.value != null && item.value != item.default && (!item.mode || item.mode == "url")) {
            savedDataUrl[item.key] = item.value;
         }
      });

      let result = {};
      for(const [key, value] of Object.entries(savedDataUrl)) {
         if(value == null || value == false) continue;
         result[key] = value;
      }

      router.push({ query: result });

      //Local storage saving
      const valuesToLocalStorageSave = props.values.filter((item) => item.mode == "local");

      for(const item of valuesToLocalStorageSave) {
         if(item.value != null && item.value != item.default) {
            localStorage.setItem(props.localStoragePrefix + item.key, JSON.stringify(item.value));
         }
      }

   }

   else if(mode == "load") {
      //Url loading
      let savedDataUrl = route.query;

      props.values.forEach((item) => {
         if(savedDataUrl[item.key] == "true") savedDataUrl[item.key] = true;
         if(savedDataUrl[item.key] == "false") savedDataUrl[item.key] = false;

         if(item.value == savedDataUrl[item.key]) {
            return;
         }

         if(savedDataUrl[item.key] != null) {
            item.change(savedDataUrl[item.key]);
         } else {
            if(item?.default) item.change(item.default);
         }
      });

      //Local storage loading
      let savedDataLocal = {};

      const valuesToLocalStorageLoad = props.values.filter((item) => item.mode == "local");

      for(const item of valuesToLocalStorageLoad) {
         let savedData = localStorage.getItem(props.localStoragePrefix + item.key);
         if(savedData) {
            savedDataLocal[item.key] = JSON.parse(savedData);
         }
      }

      for(const item of valuesToLocalStorageLoad) {
         if(savedDataLocal[item.key] == item.value) {
            continue;
         }

         if(savedDataLocal[item.key] != null) {
            item.change(savedDataLocal[item.key]);
         } else {
            if(item?.default) item.change(item.default);
         }
      }
   }
};

</script>

<template>
</template>
