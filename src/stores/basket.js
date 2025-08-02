import { defineStore, acceptHMRUpdate  } from "pinia";

import toast from "@/includes/toast";
import axios from "axios";
import moment from "moment";
import i18n from "../includes/i18n.js";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const env = import.meta.env.VITE_APP_ENV;

const basket = defineStore("basket", {
  state: () => ({
    basketAppVersion: '0.0.1',
    newProductInput: '',
    currentView: 'list',
    currentBasket: '',
    connectedBaskets: {},
    basketProducts: [],
    products: new Map(),
    loading: {
      basketProducts: false,
      checkIfBasketExists: false,
    },
    newBasketData: {}, 
    connectBasketData: {},
  }),

  actions: {
    resetNewBasketData() {
      this.newBasketData = {
        name: '',
        slug: '',
        password: '',
        repeatPassword: '',
      };
    },

    resetConnectBasketData() {
      this.connectBasketData = {
        slug: '',
        password: '',
      };
    },

    async checkIfBasketExists(slug) {
      try {
        this.loading.checkIfBasketExists = true;
        const response = await apiClient.get(`/api/basket/check-if-basket-exists/${slug}`);
        return response.data.exists;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        this.loading.checkIfBasketExists = false;
      }
    },

    async getBasketProducts() {
      try {
        this.loading.basketProducts = true;
        const response = await apiClient.get(`/api/basket/${this.currentBasket}`);
        this.basketProducts = response.data.basketProducts;
        response.data.products.forEach(product => {
          this.products.set(product.id, product);
        });
        console.log(this.products);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading.basketProducts = false;
      }
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(basket, import.meta.hot));
}

export default basket;
