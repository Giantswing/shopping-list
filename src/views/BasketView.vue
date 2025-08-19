<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { basket } from "@/stores/basket";
const useBasket = basket();

import AddProductInput from "@/views/AddProductInput.vue";
import BasketList from "@/views/BasketList.vue";
import BurguerMenu from "@/views/BurguerMenu.vue";

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
  <div class="flex flex-col w-full h-full relative">
    <BurguerMenu />
    <div class="flex-grow w-full overflow-y-auto overflow-x-hidden"><BasketList /></div>
    <AddProductInput />
  </div>
</template>
