import { defineStore } from "pinia";

import toast from "@/includes/toast";
import axios from "axios";
import moment from "moment";
import i18n from "../includes/i18n.js";

// const apiClient = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });

const env = import.meta.env.VITE_APP_ENV;

export default defineStore("registration", {
  state: () => ({
    tutorVersion: '0.0.1',
  }),

  actions: {
    test() {
      console.log("test");
    },
  },
});



