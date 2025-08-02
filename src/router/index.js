import { createRouter, createWebHistory } from "vue-router";
import BasketView from "@/views/BasketView.vue"

const routes = [
   {
      path: "/:slug",
      name: "basket",
      component: BasketView,
   },
];

const router = createRouter({
   history: createWebHistory(),
   routes,
});

export default router;
