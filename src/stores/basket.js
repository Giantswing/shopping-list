import { defineStore, acceptHMRUpdate } from "pinia";

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";
import apiClient from "@/includes/api-client";

const env = import.meta.env.VITE_APP_ENV;

export const basket = defineStore("basket", {
  state: () => ({
    basketAppVersion: '1.4.0',
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
      groupBy: 'none',
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

    types: [
      {
        value: 'oils_spices_sauces',
        emoji: '🌶️',
        color: '#d97706',
      },
      {
        value: 'water_and_soft_drinks',
        emoji: '🥤',
        color: '#3bb4e5',
      },
      {
        value: 'snacks_and_sweets',
        emoji: '🍬',
        color: '#e75480',
      },
      {
        value: 'rice_pulses_pasta',
        emoji: '🍚',
        color: '#f5e6b2',
      },
      {
        value: 'baby',
        emoji: '🍼',
        color: '#f7b2d9',
      },
      {
        value: 'alcohol',
        emoji: '🍷',
        color: '#a8324a',
      },
      {
        value: 'coffee_and_tea',
        emoji: '☕',
        color: '#b08968',
      },
      {
        value: 'meat',
        emoji: '🥩',
        color: '#e57373',
      },
      {
        value: 'deli_and_cheese',
        emoji: '🧀',
        color: '#ffe066',
      },
      {
        value: 'frozen',
        emoji: '❄️',
        color: '#7fd8f5',
      },
      {
        value: 'canned_and_soups',
        emoji: '🥫',
        color: '#b0b0b0',
      },
      {
        value: 'personal_care',
        emoji: '🧴',
        color: '#f7cac9',
      },
      {
        value: 'pharmacy',
        emoji: '💊',
        color: '#b388ff',
      },
      {
        value: 'fruit_and_vegetables',
        emoji: '🥦',
        color: '#7ed957',
      },
      {
        value: 'dairy_and_eggs',
        emoji: '🥚',
        color: '#fff7d6',
      },
      {
        value: 'cleaning_and_home',
        emoji: '🧽',
        color: '#b2dfdb',
      },
      {
        value: 'seafood_and_fish',
        emoji: '🐟',
        color: '#4fc3f7',
      },
      {
        value: 'pets',
        emoji: '🐾',
        color: '#a1887f',
      },
      {
        value: 'bakery_and_pastry',
        emoji: '🥐',
        color: '#f6c177',
      },
      {
        value: 'prepared_food',
        emoji: '🍱',
        color: '#b2bec3',
      },
      {
        value: 'uncategorized',
        emoji: '❓',
        color: '#bdbdbd',
      },
    ]

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

        let parsedProductName = product.trim().toLowerCase();
        parsedProductName = parsedProductName.replace(/[^a-z0-9\sñ]/g, '');

        const existingProduct = this.products.find(p => p.name.toLowerCase() === parsedProductName);
        if (existingProduct && existingProduct.is_added) {
          return true;
        }

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
          prod.last_added_at = new Date().toISOString();

          return true;
        }

        const response = await apiClient.post(`/api/basket/${this.currentBasket}/add-product`, {
          product: product,
        });
        if (response.data.success) {
          this.newProductInput = "";
          this.products = response.data.products;

          let addedProduct = this.products.find(p => p.name === product);
          if (!addedProduct?.type) {
            this.getProductType(addedProduct.id);
          }

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

    async getProductType(productId) {
      try {
        const response = await apiClient.get(`/api/ai/get-product-type/${productId}`);
        if (response.data.type) {
          let product = this.products.find(p => p.id === productId);
          if (product) {
            product.type = response.data?.type || 'uncategorized';
          }
        } else {
          throw new Error(response.data.error);
        }
      } catch (error) {
        console.error(error);
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
        if (this.offlineMode) {
          return;
        }

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
          this.editQuantityModal = false;
          this.productDetailsId = null;
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
    },

    async closeEditQuantityModal(newQuantity) {

      this.editQuantityModal = false;

      let product = this.products.find(p => p.id === this.productDetailsId);

      if (newQuantity === product.quantity) {
        this.productDetailsId = null;
        return;
      }

      if (product) {
        await this.editProductQuantity(this.productDetailsId, newQuantity);
      }

      this.productDetailsId = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(basket, import.meta.hot));
}
