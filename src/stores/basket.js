import { defineStore, acceptHMRUpdate  } from "pinia";

import toast from "@/includes/toast";
const useToast = toast();

import i18n from "@/includes/i18n.js";
import apiClient from "@/includes/api-client";

const env = import.meta.env.VITE_APP_ENV;

export const basket = defineStore("basket", {
  state: () => ({
    basketAppVersion: '0.0.1',
    newProductInput: '',
    currentView: 'list',
    burguerMenuOpen: false,
    currentBasket: '',
    connectedBaskets: [],
    basketProducts: [],
    products: new Map(),
    loading: {
      basketProducts: false,
      checkIfBasketExists: false,
      createBasket: false,
      connectToBasket: false,
      addProductToBasketNames: [],
      removeProductFromBasketIds: [],
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
        name: '',
      };
    },

    getBasketCredentials(slug) {
      const basketCredentials = this.connectedBaskets.find(basket => basket.slug === slug);
      if (basketCredentials) {
        return basketCredentials;
      } else {
        return null;
      }
    },

    addBasketCredentials(name, slug, password) {
      const basket = this.connectedBaskets.find(basket => basket.slug === slug);
      if (basket) {
        basket.password = password;
      } else {
        this.connectedBaskets.push({
          name: name,
          slug: slug,
          password: password,
        });
      }
    },

    async checkIfBasketExists(slug) {
      try {
        this.loading.checkIfBasketExists = true;
        const response = await apiClient.get(`/api/basket/check-if-basket-exists/${slug}`);
        if (response.data.exists) {
          this.connectBasketData.name = response.data.name;
          this.connectBasketData.slug = slug;
          return true;
        } else {
          useToast.error(i18n.global.t("basket-not-found"));
          return false;
        }
      } catch (error) {
        console.error(error);
        useToast.error(i18n.global.t("basket-not-found"));
        this.connectBasketData.slug = '';
        return false;
      } finally {
        this.loading.checkIfBasketExists = false;
      }
    },

    async connectToBasket() {
      try {
        this.loading.connectToBasket = true;
        const response = await apiClient.post(`/api/basket/connect`, this.connectBasketData);
        if (response.data.success) {
          this.addBasketCredentials(this.connectBasketData.name, this.connectBasketData.slug, this.connectBasketData.password);

          this.currentBasket = this.connectBasketData.slug;
          this.connectBasketData = {};
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        if (error.response.data.error === 'invalid-password') {
          useToast.error(i18n.global.t("invalid-password"));
        } else {
          useToast.error(i18n.global.t("internal-server-error"));
        }
        console.error(error);
      } finally {
        this.loading.connectToBasket = false;
      }
    },

    async addProductToBasket(product) {
      try {
        console.log('addProductToBasket', product);
        this.loading.addProductToBasketNames.push(product);
        const response = await apiClient.post(`/api/basket/${this.currentBasket}/add-product`, {
          product: product,
        });
        if (response.data.success) {
          this.basketProducts = response.data.basketProducts;

          this.products = new Map();
          response.data.products.forEach(product => {
            this.products.set(product.id, product);
          });

          this.newProductInput = "";
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        useToast.error(i18n.global.t("internal-server-error"));
        console.error(error);
      } finally {
        this.loading.addProductToBasketNames = this.loading.addProductToBasketNames.filter(name => name !== product);
      }
    },

    async removeProductFromBasket(productId) {
      try {
        this.loading.removeProductFromBasketIds.push(productId);
        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-product`, {
          product_id: productId,
        });
        if (response.data.success) {
          this.basketProducts = response.data.basketProducts;
          this.products = new Map();
          response.data.products.forEach(product => {
            this.products.set(product.id, product);
          });
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        console.error(error);
        useToast.error(i18n.global.t("internal-server-error"));
      } finally {
        this.loading.removeProductFromBasketIds = this.loading.removeProductFromBasketIds.filter(id => id !== productId);
      }
    },

    async createBasket() {
      try {
        this.loading.createBasket = true;
        const response = await apiClient.post(`/api/basket/create`, this.newBasketData);
        if (response.data.success) {
          this.addBasketCredentials(this.newBasketData.name, response.data.slug, this.newBasketData.password);
          this.currentBasket = response.data.slug;
          this.newBasketData = {};
          return true;
        } else {
          useToast.error(i18n.global.t("basket-already-exists"));
          return false;
        }
      } catch (error) {
        console.error(error);
        useToast.error(i18n.global.t("internal-server-error"));
      } finally {
        this.loading.createBasket = false;
      }
    },

    async getBasketProducts() {
      try {
        this.loading.basketProducts = true;
        const response = await apiClient.get(`/api/basket/${this.currentBasket}`);
        this.basketProducts = response.data.basketProducts;
        this.products = new Map();
        response.data.products.forEach(product => {
          this.products.set(product.id, product);
        });
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
