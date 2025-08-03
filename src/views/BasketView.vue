<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  document.title = "Shopping List";
  let slug = route.params.slug;

  if (slug) {
    if (!(await useBasket.checkIfBasketExists(slug))) {
      router.push("/");
    }

    const basketCredentials = useBasket.getBasketCredentials(slug);
    /* If we don't have credentials */
    if (!basketCredentials) {
      router.push(`/connect-basket/${slug}`);
    } else {
      useBasket.connectBasketData.password = basketCredentials.password;

      /* Invalid credentials, password has changed */
      if (!(await useBasket.connectToBasket())) {
        router.push(`/connect-basket/${slug}`);
      }
    }

    /* If we reach this point, we have valid credentials */
    useBasket.getBasketProducts();
  }
});
</script>

<template>
  <div class="w-full flex flex-col items-center h-screen px-2">
    <div class="flex-grow w-full overflow-y-auto"><BasketList /></div>
    <AddProductInput />
  </div>
</template>
