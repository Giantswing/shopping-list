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
    currentBasket: null,
    basketProducts: [],
    products: [],
    loading: {
      basketProducts: false,
    }
  }),

  actions: {
    async ping() {
      const response = await apiClient.get('/api/ping');
      console.log(response);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(basket, import.meta.hot));
}

export default basket;
