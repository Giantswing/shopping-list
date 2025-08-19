import { defineStore, acceptHMRUpdate  } from "pinia";

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";
import apiClient from "@/includes/api-client";

const env = import.meta.env.VITE_APP_ENV;

export const basket = defineStore("basket", {
  state: () => ({
    basketAppVersion: '0.1.0',
    newProductInput: '',
    currentView: 'list',
    burguerMenuOpen: false,
    currentBasket: '',
    connectedBaskets: [],
    lastUsedBasket: '',
    basketProducts: [],
    productDetailsId: null,
    offlineProductsToRemove: [],
    products: new Map(),
    refreshItemsInterval: null,
    shouldAutoUpdate: true,
    loading: {
      basketProducts: true,
      checkIfBasketExists: false,
      createBasket: false,
      connectToBasket: false,
      addProductToBasketNames: [],
      removeProductFromBasketIds: [],
      removeProductFromListIds: [],
    },
    newBasketData: {}, 
    connectBasketData: {},
    offlineMode: false,
  }),

  actions: {
    startRefreshItemsInterval() {
      this.refreshItemsInterval = setInterval(() => {
        this.getBasketProducts(true);
      }, 10000);
    },

    stopRefreshItemsInterval() {
      clearInterval(this.refreshItemsInterval);
    },

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
        if (this.offlineMode) {
          return this.connectedBaskets.find(basket => basket.slug === slug);
        }

        this.loading.checkIfBasketExists = true;
        const response = await apiClient.get(`/api/basket/check-if-basket-exists/${slug}`);
        if (response.data.exists) {
          this.connectBasketData.name = response.data.name;
          this.connectBasketData.slug = slug;
          return true;
        } else {
          toast.error(i18n.global.t("basket-not-found"));
          return false;
        }
      } catch (error) {
        console.error(error);
        toast.error(i18n.global.t("basket-not-found"));
        this.connectBasketData.slug = '';
        this.lastUsedBasket = '';
        return false;
      } finally {
        this.loading.checkIfBasketExists = false;
      }
    },

    async connectToBasket() {
      try {
        if (this.offlineMode) {
          return this.connectedBaskets.find(basket => basket.slug === this.connectBasketData.slug);
        }

        this.loading.connectToBasket = true;
        const response = await apiClient.post(`/api/basket/connect`, this.connectBasketData);
        if (response.data.success) {
          this.addBasketCredentials(this.connectBasketData.name, this.connectBasketData.slug, this.connectBasketData.password);
          this.lastUsedBasket = this.connectBasketData.slug;

          this.currentBasket = this.connectBasketData.slug;
          this.connectBasketData = {};
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        this.lastUsedBasket = '';

        if (error.response.data.error === 'invalid-password') {
          toast.error(i18n.global.t("invalid-password"));
        } else {
          toast.error(i18n.global.t("internal-server-error"));
        }
        console.error(error);
      } finally {
        this.loading.connectToBasket = false;
      }
    },

    async syncBasketState() {
      /* After the app has been disconnected for a moment/while
      it will look at the basket products and create any products
      that have been added while offline.
      */

      console.warn("Syncing basket state");
      const productsToCreate = this.basketProducts.filter(product => product.offline);
      console.log("Products to create", productsToCreate);
      for (const product of productsToCreate) {
        await this.addProductToBasket(this.products.get(product.product_id).name);
      }

      const productsToRemove = this.offlineProductsToRemove.filter(productId => !this.basketProducts.some(p => p.product_id === productId));
      console.log("Products to remove", productsToRemove);
      for (const productId of productsToRemove) {
        await this.removeProductFromBasket(productId);
      }

      this.offlineProductsToRemove = [];
    },

    async addProductToBasket(product) {
      try {
        this.shouldAutoUpdate = false;
        this.loading.addProductToBasketNames.push(product);

        if (this.offlineMode) {
          let productId = null;

          let existingProduct = Array.from(this.products.values()).find(p => p.name === product);

          if (existingProduct) {
            productId = existingProduct.id;
          } else {
            productId = Math.floor(Math.random() * 10000);
            this.products.set(productId, {
              name: product,
              id: productId,
              offline: true,
            });
          }

          this.basketProducts.push({
            product_id: productId,
            offline: true,
          });

          console.log("Basket products", this.basketProducts);

          return true;
        }

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
        toast.error(i18n.global.t("internal-server-error"));
        console.error(error);
      } finally {
        this.loading.addProductToBasketNames = this.loading.addProductToBasketNames.filter(name => name !== product);
        this.shouldAutoUpdate = true;
      }
    },

    async removeProductFromList(productId) {
      try {
        if (this.offlineMode) {
          return;
        }

        this.shouldAutoUpdate = false;

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-product-from-list`, {
          product_id: productId,
        });
        if (response.data.success) {
          this.basketProducts = response.data.basketProducts;
          this.products = new Map();
          response.data.products.forEach(product => {
            this.products.set(product.id, product);
          });
          this.productDetailsId = null;
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        console.error(error);
        toast.error(i18n.global.t("internal-server-error"));
      } finally {
        this.loading.removeProductFromListIds = this.loading.removeProductFromListIds.filter(id => id !== productId);
        this.shouldAutoUpdate = true;
      }
    },

    async removeProductFromBasket(productId) {
      try {
        this.shouldAutoUpdate = false;
        this.loading.removeProductFromBasketIds.push(productId);

        if (this.offlineMode) {
          this.offlineProductsToRemove.push(productId);

          this.basketProducts = this.basketProducts.filter(p => p.product_id !== productId);

          return true;
        }

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-product-from-basket`, {
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
        toast.error(i18n.global.t("internal-server-error"));
      } finally {
        this.loading.removeProductFromBasketIds = this.loading.removeProductFromBasketIds.filter(id => id !== productId);
        this.shouldAutoUpdate = true;
      }
    },

    async createBasket() {
      try {
        this.loading.createBasket = true;
        const response = await apiClient.post(`/api/basket/create`, this.newBasketData);
        if (response.data.success) {
          this.addBasketCredentials(this.newBasketData.name, response.data.slug, this.newBasketData.password);
          this.lastUsedBasket = response.data.slug;
          this.currentBasket = response.data.slug;
          this.newBasketData = {};
          return true;
        } else {
          toast.error(i18n.global.t(response.data.error));
          return false;
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.error);
      } finally {
        this.loading.createBasket = false;
      }
    },

    async getBasketProducts(fromAutoUpdate = false) {
      try {
        if (this.offlineMode) {
          return;
        }

        if (fromAutoUpdate && !this.shouldAutoUpdate) {
          return;
        }

        if (!fromAutoUpdate) {
          this.loading.basketProducts = true;
        }

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
