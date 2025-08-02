<script setup>
import { computed, ref, toRefs, nextTick, watch, onMounted } from "vue";
import toast from "@/includes/toast";

const emit = defineEmits(["change", "resetFiles"]);

const strikeIndex = ref(null);

const props = defineProps({
   multiple: {
      type: Boolean,
      default: false,
      required: false,
   },
   // Accepts file types like "image/*" or "image/png, image/jpeg"
   accept: {
      type: String,
      default: "",
      required: false,
   },
   files: {
      type: Array,
      default: [],
      required: false,
   },
   addedFields: {
      type: Object,
      default: {},
      required: false,
   },
   hideFiles: {
      type: Boolean,
      default: false,
      required: false,
   },
   onlyShowIcon: {
      type: Boolean,
      default: false,
      required: false,
   },
   customIcon: {
      default: null,
      required: false,
   },
   labelColor: {
      type: String,
      default: "bg-white",
      required: false,
   },
   allowSameFile: {
      type: Boolean,
      default: false,
      required: false,
   },
   maxSize: {
      type: Number,
      default: 14336, // 14MB
      required: false,
   },
   minimumResolutionImage: {
      type: Object,
      default: {},
      required: false,
   },
   customButtonClass: {
      type: String,
      default: "",
      required: false,
   },
   buttonTippy: {
      type: Object,
      default: {},
      required: false,
   },
   resetFiles: {
      type: Boolean,
      default: false,
      required: false,
   },

   showCompressionAdvice: {
      type: Boolean,
      default: false,
      required: false,
   },
   hideFileCount: {
      type: Boolean,
      default: false,
      required: false,
   },
   uploadAsBase64: {
      type: Boolean,
      default: false,
      required: false,
   },
});


watch(() => props.resetFiles, (resetFiles) => {
   if (resetFiles) {
      files.value = [];
      fileInput.value.value = "";
      emit("resetFiles");
   }
});


onMounted(() => {
   if (props.resetFiles) {
      files.value = [];
      fileInput.value.value = "";
      emit("resetFiles");
   }
});

const fileInput = ref(null);

const files = ref(props.files);

const checkImageResolution = (file, minimumResolution) => {
   return new Promise((resolve, reject) => {
      if(file.type.includes("image") && minimumResolution.width && minimumResolution.height) {
         const img = new Image();
         img.src = URL.createObjectURL(file);
         img.onload = () => {
            let width = img.width > img.height ? img.width : img.height;
            let height = img.width > img.height ? img.height : img.width;

            if (width < minimumResolution.width || height < minimumResolution.height) {
               toast().error(`File ${file.name} does not meet the minimum resolution of ${minimumResolution.width}x${minimumResolution.height}`);
               resolve(true);
            } else {
               resolve(false);
            }
         };
         img.onerror = () => {
            reject(new Error("Failed to load image"));
         };
      } else {
         resolve(false); // resolutionError = false
      }
   });
};


const addFiles = async(newFiles) => {
   let addedFiles = props.multiple ? [...newFiles] : [newFiles[0]];

   for (const file of addedFiles) {
      if (file.size > props.maxSize * 1024) {
         toast().error(`File ${file.name} is too large. Max size is ${props.maxSize}KB`);
         continue;
      }

      const resolutionError = await checkImageResolution(file, props.minimumResolutionImage);
      if (resolutionError) continue;

      if (!props.allowSameFile && props.multiple && files.value.some((f) => f.file.name === file.name)) {
         toast().error(`File ${file.name} already exists`);
         continue;
      }

      if (!props.uploadAsBase64) {
         files.value.push({
            file: file,
            name: file.name,
            url: URL.createObjectURL(file),
            id: `temp-${Math.random().toString(36).substring(7)}-${file.name}`,
            ...props.addedFields
         });
      } else {
         try {
            const base64File = await fileToBase64(file);
            files.value.push({
               file: base64File,
               name: file.name,
               url: URL.createObjectURL(file),
               id: `temp-${Math.random().toString(36).substring(7)}-${file.name}`,
               ...props.addedFields
            });
         } catch (error) {
            toast().error(`Failed to convert ${file.name} to base64.`);
         }
      }
   }

   emit("change", props.multiple ? files.value : files.value[files.value.length - 1]);

   if (props.multiple == false) {
      //Only leave the last file uploaded
      files.value = files.value.slice(-1);
   }
};

const fileToBase64 = (file) => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsDataURL(file);
   });
};

const removeFile = (index) => {
   files.value.splice(index, 1);
   emit("change", files.value);
}

const downloadFile = (index) => {
   const file = files.value[index];
   const url = file?.url || file; 

   if (url) {
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = url;
      link.download = file.name ? file.name : convertUrlToName(url);
      link.click();
   }
};


const customId = computed(() => {
   return `upload-${Math.random().toString(36).substring(7)}`;
})

const numberOfFiles = computed(() => {
   if (files.value == "" || !files.value || files.value.length == 0) return 0;
   return files.value.filter((f) => f?.file || f?.url || f?.length > 0).length;
});

const convertUrlToName = (url) => {
   if (typeof url === 'string') {
      let result = url.split("/").pop();
      result = result.replace(/%20/g, " ");
      result = result.replace(/%28/g, "(");
      result = result.replace(/%29/g, ")");
      return result;
   } else if (url && url.name) {
      return url.name; // if url is a File object, return its name property
   }
   return "";
};
</script>

<template>
   <div class="w-full flex flex-col">
      <div
         v-if="showCompressionAdvice"
         class="w-full p-2 bg-red-200 text-red-700 text-sm font-semibold rounded-md mb-8 border-2 border-red-500 flex items-center gap-3"
      >
         <MintyIcon :icon="'ic:round-warning'" class="text-xl ml-1 animate-ping" />
         <div class="w-full flex justify-between items-center">
            <span v-html="$t('global.compress-images-warning')" />

            <div class="flex gap-2">
               <MintyButton
                  class="bg-red-500 hover:!bg-red-700 text-white"
                  :link="'https://www.iloveimg.com/compress-image'"
               >
                  Compress
               </MintyButton>
               <MintyButton
                  class="bg-red-500 hover:!bg-red-700 text-white"
                  :link="'https://www.iloveimg.com/resize-image'"
               >
                  Resize
               </MintyButton>
            </div>
         </div>
      </div>

      <div class="grid grid-cols-4 w-full gap-x-4">
         <input 
            ref="fileInput"
            @change="addFiles($event.target.files)"
            hidden
            type="file" 
            :id="customId"
            :multiple="multiple"
            :accept="accept"
         />

         <label 
            :for="customId"
            :class="[
               'flex items-center justify-center w-full h-fit gap-3 bg-blue-active text-white p-2 px-4 font-semibold rounded-md cursor-pointer transition-all hover:brightness-[1.2] min-h-[44px] text-2xl',
               props.hideFiles ? 'col-span-4' : 'col-span-1',
               props.customButtonClass
            ]"

            v-tippy="buttonTippy"
         >
            <MintyIcon v-if="!props.customIcon" :icon="'fas:plus'" />
            <MintyIcon v-else :icon="props.customIcon" />

            <span v-if="!onlyShowIcon">{{ props.multiple ? $t('global.add-files') : $t('global.choose-file')}}</span>
         </label>

         <div 
            v-if="!props.hideFiles"
            class="relative col-span-3 border-2 border-blue-active border-dashed border-opacity-25 rounded-md flex flex-wrap gap-x-4 gap-y-1 p-2 pt-3 justify-center items-center"
         >
            <p 
               v-if="props.hideFileCount == false"
               class="absolute top-0 left-2 px-2 -translate-y-1/2 text-sm font-semibold text-gray-700 rounded-full"
               :class="labelColor"
            >
               {{ numberOfFiles }} {{ $t('global.file') }}{{ numberOfFiles == 1 ? '' : 's' }} 
            </p>
            <span 
               v-for="(file,index) in files"
               class="relative inline-block text-sm font-semibold text-gray-700 cursor-pointer transition-all group strike"
               :class="strikeIndex === index ? 'strike-through' : ''"
            >

               <p class="absolute mt-2 top-[-20px] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:mt-0 hover:mt-0 group-hover:opacity-100 hover:opacity-100 hover:pointer-events-auto group-hover:pointer-events-auto flex items-center justify-center gap-3 px-5 py-2 bg-white bg-opacity-90 shadow-lg rounded-full transition-all duration-100 text-xl">
                  <button 
                     class="h-[28px] aspect-square rounded-full bg-red-200 text-red-700 flex items-center justify-center hover:scale-125 transition-all duration-100 px-6 p-1"
                     @mouseenter="strikeIndex = index"
                     @mouseleave="strikeIndex = null"
                     @click="() => { removeFile(index); }"
                  >
                     <MintyIcon :icon="'iconoir:trash-solid'" />
                  </button>

                  <button 
                     class="h-[28px] aspect-square rounded-full bg-blue-200 text-blue-700 flex items-center justify-center hover:scale-125 transition-all duration-100 px-6 p-1"
                     @click="() => { downloadFile(index); }"
                  >
                     <MintyIcon :icon="'flowbite:download-solid'" />
                  </button>
               </p>
               {{ file?.file?.name ? file.file.name : convertUrlToName(file) }}
            </span>
         </div>

      </div>
   </div>
</template>

<style lang="scss">
.warnstrong {
   @apply font-bold text-white inline-block bg-red-800 px-2 rounded-sm;
}


.strike {
   position: relative;

   &::after {
      transition: all 0.35s;
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      height: 2px;
      background-color: rgba(255, 0, 0, 0.4);
      width: 0;
   }

   // &:hover::after {
   //    width: 100%;
   // }
}

.strike-through {
   @apply text-red-700;
   &::after {
      width: 100%;
   }
}
</style>
