import { createRouter, createWebHistory } from "vue-router";
import BasketView from "@/views/BasketView.vue";
import ConnectBasketView from "@/views/ConnectBasketView.vue";
import HomeView from "@/views/HomeView.vue";

const routes = [
   {
      path: "/basket/:slug",
      name: "basket",
      component: BasketView,
   },

   {
      path: "/connect-basket/:slug",
      name: "connect-basket",
      component: ConnectBasketView,
   },

   {
      path: "/",
      name: "home",
      component: HomeView,
   },
];

const router = createRouter({
   history: createWebHistory(),
   routes,
});

export default router;
