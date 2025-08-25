import { defineStore, acceptHMRUpdate  } from "pinia";

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";
import apiClient from "@/includes/api-client";

const env = import.meta.env.VITE_APP_ENV;

export const basket = defineStore("basket", {
  state: () => ({
    basketAppVersion: '1.0.0',
    newProductInput: '',
    currentView: 'list',
    burguerMenuOpen: false,
    currentBasket: '',
    connectedBaskets: [],
    lastUsedBasket: '',
    productDetailsId: null,
    offlineProductsToRemove: [],
    products: [],
    refreshItemsInterval: null,
    shouldAutoUpdate: true,
    editQuantityModal: false,
    filters: {
      showOnlyAdded: false,
    },
    loading: {
      basketProducts: true,
      checkIfBasketExists: false,
      createBasket: false,
      connectToBasket: false,
      addProductToBasketNames: [],
      removeProductFromBasketIds: [],
      removeProductPermanentlyIds: [],
      removeAllProductsFromBasket: false,
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
          let basket = this.getBasketCredentials(slug);
          if (basket) {
            this.connectBasketData.name = basket.name;
            this.connectBasketData.slug = slug;
            return true;
          } else {
            return false;
          }
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
          let basket = this.getBasketCredentials(this.connectBasketData.slug);
          if (basket) {
            this.lastUsedBasket = this.connectBasketData.slug;
            this.currentBasket = this.connectBasketData.slug;
            this.connectBasketData = {};
            return true;
          } else {
            this.lastUsedBasket = '';
            this.currentBasket = '';
            return false;
          }
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
      const productsToCreate = this.products.filter(product => product.offline);
      console.log("Products to create", productsToCreate);
      for (const product of productsToCreate) {
        await this.addProductToBasket(product.name);
      }

      const productsToRemove = this.products.filter(product => product.offline).map(product => product.id);
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
          let existingProduct = this.products.find(p => p.name === product);
          let productId = existingProduct ? existingProduct.id : Math.floor(Math.random() * 10000);

          if (!existingProduct) {
            this.products.push({
              name: product,
              id: productId,
              offline: true,
              quantity: 0,
              is_added: false,
            });
          }

          let prod = this.products.find(p => p.id === productId);
          prod.quantity++;
          prod.is_added = true;

          return true;
        }

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/add-product`, {
          product: product,
        });
        if (response.data.success) {
          this.newProductInput = "";
          this.products = response.data.products;
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

    async editProductQuantity(productId, quantity) {
      try {
        this.shouldAutoUpdate = false;

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/edit-product-quantity`, {
          product_id: productId,
          quantity: quantity,
        });
        if (response.data.success) {
          this.products = this.products.map(p => (p.id === productId ? { ...p, quantity: quantity } : p));

          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        console.error(error);
        toast.error(i18n.global.t("internal-server-error"));
      } finally {
        this.shouldAutoUpdate = true;
      }
    },

    async removeAllProductsFromBasket() {
      try {
        this.shouldAutoUpdate = false;
        this.loading.removeAllProductsFromBasket = true;

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-all-products-from-basket`);

        if (response.data.success) {
          this.products.forEach(p => (p.is_added = false));
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        console.error(error);
        toast.error(i18n.global.t(error.response.data.error));
        return false;
      } finally {
        this.loading.removeAllProductsFromBasket = false;
        this.shouldAutoUpdate = true;
      }
    },

    async removeProductPermanently(productId) {
      try {
        if (this.offlineMode) {
          return;
        }

        this.shouldAutoUpdate = false;

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-product-permanently`, {
          product_id: productId,
        });
        if (response.data.success) {
          this.products = this.products.filter(p => p.id !== productId);
          this.productDetailsId = null;
          return true;
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        console.error(error);
        toast.error(i18n.global.t("internal-server-error"));
      } finally {
        this.loading.removeProductPermanentlyIds = this.loading.removeProductPermanentlyIds.filter(id => id !== productId);
        this.shouldAutoUpdate = true;
      }
    },

    async removeProductFromBasket(productId) {
      try {
        this.shouldAutoUpdate = false;
        this.loading.removeProductFromBasketIds.push(productId);

        if (this.offlineMode) {
          this.offlineProductsToRemove.push(productId);

          let prod = this.products.find(p => p.id === productId);
          prod.is_added = false;

          return true;
        }

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-product-from-basket`, {
          product_id: productId,
        });
        if (response.data.success) {
          this.products = response.data.products;

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
        this.products = [];
        response.data.products.forEach(product => {
          this.products.push(product);
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.loading.basketProducts = false;
      }
    },

    openEditQuantityModal(productId) {
      if (this.offlineMode) {
        return;
      }

      this.productDetailsId = productId;
      this.editQuantityModal = true;
      console.log("Product details id", this.products.find(p => p.id === productId));
      console.log("Opening edit quantity modal", this.productDetailsId);
    },

    async closeEditQuantityModal(newQuantity) {
      this.editQuantityModal = false;
      let product = this.products.find(p => p.id === this.productDetailsId);

      if (product) {
        await this.editProductQuantity(this.productDetailsId, newQuantity);
        this.productDetailsId = null;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(basket, import.meta.hot));
}
