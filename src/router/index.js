import { createRouter, createWebHistory } from "vue-router";
import BasketView from "@/views/BasketView.vue";
import HomeView from "@/views/HomeView.vue";

const routes = [
   {
      path: "/:slug",
      name: "basket",
      component: BasketView,
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
