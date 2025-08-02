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

const shop = defineStore("shop", {
  state: () => ({
    shopVersion: '0.0.1',
    newItemInput: '',
  }),

  actions: {
    test() {
      console.log("test");
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(shop, import.meta.hot));
}

export default shop;
