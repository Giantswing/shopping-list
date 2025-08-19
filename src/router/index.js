import { createRouter, createWebHistory } from "vue-router";
import BasketView from "@/views/BasketView.vue";
import ConnectBasketView from "@/views/ConnectBasketView.vue";
import HomeView from "@/views/HomeView.vue";

const routes = [
   {
      path: "/basket/:slug",
      name: "basket",
      component: BasketView,
      beforeEnter: (to, from, next) => {
         // If navigating from one basket to another, ensure proper cleanup
         if (from.name === 'basket' && to.name === 'basket' && from.params.slug !== to.params.slug) {
            // The component will handle the cleanup via the watch function
            next();
         } else {
            next();
         }
      }
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
