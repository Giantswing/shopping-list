import axios from "axios";
import { basket as useBasketStore } from "@/stores/basket";

// Ensure base URL has no trailing /api (paths in code already include /api)
const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const useBasket = useBasketStore();

  if (useBasket.currentBasket) {
    const basketCredentials = useBasket.getBasketCredentials(useBasket.currentBasket);
    if (basketCredentials) {
      config.headers['X-Basket-Slug'] = basketCredentials.slug;
      config.headers['X-Basket-Password'] = basketCredentials.password;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
