import axios from "axios";
import { basket as useBasketStore } from "@/stores/basket";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
