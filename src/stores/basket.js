import { defineStore, acceptHMRUpdate } from "pinia";

import { useToast } from "vue-toastification";
const toast = useToast();

import i18n from "@/includes/i18n.js";
import apiClient from "@/includes/api-client";

const env = import.meta.env.VITE_APP_ENV;
const LOCAL_STORAGE_PREFIX = 'shopping_list_v1_';
const SYNC_STATUS_SHOW_MS = 2000;

export const basket = defineStore("basket", {
  state: () => ({
    basketAppVersion: '2.0.0',
    newProductInput: '',
    currentView: 'list',
    burguerMenuOpen: false,
    currentBasket: '',
    connectedBaskets: [],
    lastUsedBasket: '',
    productDetailsId: null,
    products: [],
    editQuantityModal: false,
    filters: {
      showOnlyAdded: false,
      groupBy: 'none',
    },
    loading: {
      checkIfBasketExists: false,
      createBasket: false,
      connectToBasket: false,
    },
    newBasketData: {},
    connectBasketData: {},
    /** 'idle' | 'syncing' | 'success' | 'error' - drives bottom-left sync indicator */
    syncStatus: 'idle',
    refreshItemsInterval: null,
    /** Incremented when updateBasket starts; getBasketProducts only applies response if generation unchanged (avoids stale fetch overwriting optimistic state) */
    updateGeneration: 0,

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
    _setSyncStatus(status) {
      this.syncStatus = status;
      if (status === 'success' || status === 'error') {
        setTimeout(() => {
          if (this.syncStatus === status) this.syncStatus = 'idle';
        }, SYNC_STATUS_SHOW_MS);
      }
    },

    startRefreshItemsInterval() {
      this.refreshItemsInterval = setInterval(() => {
        if (this.syncStatus === 'syncing') return;
        this.getBasketProducts(true);
      }, 10000);
    },

    stopRefreshItemsInterval() {
      if (this.refreshItemsInterval) {
        clearInterval(this.refreshItemsInterval);
        this.refreshItemsInterval = null;
      }
    },

    _productsStorageKey(slug) {
      return `${LOCAL_STORAGE_PREFIX}products_${slug || this.currentBasket}`;
    },

    hydrateProductsFromLocalStorage(slug) {
      const key = this._productsStorageKey(slug);
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length >= 0) {
            this.products = parsed;
            return true;
          }
        }
      } catch (e) {
        console.warn('Failed to hydrate products from localStorage', e);
      }
      return false;
    },

    persistProductsToLocalStorage() {
      const key = this._productsStorageKey(this.currentBasket);
      if (!key.includes('undefined')) {
        try {
          localStorage.setItem(key, JSON.stringify(this.products));
        } catch (e) {
          console.warn('Failed to persist products to localStorage', e);
        }
      }
    },

    /** Optimistic update: set products in state, persist to localStorage, sync to API in background */
    async updateBasket(products) {
      this.updateGeneration++;
      const generationForThisUpdate = this.updateGeneration;
      const payload = products.map(p => ({
        id: p.id || undefined,
        name: p.name,
        is_added: !!p.is_added,
        quantity: Math.max(1, parseInt(p.quantity, 10) || 1),
      }));
      const previous = [...this.products];
      this.products = products;
      this.persistProductsToLocalStorage();
      if (this.newProductInput) this.newProductInput = '';

      this._setSyncStatus('syncing');
      try {
        const response = await apiClient.put(`/api/basket/${this.currentBasket}`, { products: payload });
        if (this.updateGeneration !== generationForThisUpdate) return;
        if (response.data.success && response.data.products) {
          this.products = response.data.products;
          this.persistProductsToLocalStorage();
          const added = this.products.find(p => p.name === payload.find(x => !x.id)?.name);
          if (added && !added.type) this.getProductType(added.id);
          this._setSyncStatus('success');
        } else {
          throw new Error(response.data.error || 'Update failed');
        }
      } catch (error) {
        console.error(error);
        if (this.updateGeneration === generationForThisUpdate) {
          this.products = previous;
          this.persistProductsToLocalStorage();
          this._setSyncStatus('error');
          toast.error(i18n.global.t("internal-server-error"));
        }
      }
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

        if (error.response?.data?.error === 'invalid-password') {
          toast.error(i18n.global.t("invalid-password"));
        } else {
          toast.error(i18n.global.t("internal-server-error"));
        }
        console.error(error);
      } finally {
        this.loading.connectToBasket = false;
      }
    },

    addProductToBasket(productName) {
      const name = (typeof productName === 'string' ? productName : productName?.name || '').trim();
      if (!name) return;

      const parsed = name.toLowerCase().replace(/[^a-z0-9\sñ]/g, '');
      const existing = this.products.find(p => (p.name || '').toLowerCase().replace(/[^a-z0-9\sñ]/g, '') === parsed);
      if (existing && existing.is_added) return;

      let next;
      if (existing) {
        next = this.products.map(p =>
          p.id === existing.id
            ? { ...p, quantity: 1, is_added: true, last_added_at: new Date().toISOString() }
            : p
        );
      } else {
        next = [
          ...this.products,
          {
            id: null,
            name: name,
            quantity: 1,
            is_added: true,
            last_added_at: new Date().toISOString(),
            times_added: 1,
          },
        ];
      }
      this.updateBasket(next);
    },

    setProductAdded(productId, is_added) {
      const next = this.products.map(p =>
        p.id === productId
          ? { ...p, is_added: !!is_added, quantity: is_added ? 1 : (p.quantity || 1) }
          : p
      );
      this.updateBasket(next);
    },

    setProductQuantity(productId, quantity) {
      const q = Math.max(1, parseInt(quantity, 10) || 1);
      const next = this.products.map(p => (p.id === productId ? { ...p, quantity: q } : p));
      this.updateBasket(next);
    },

    removeAllProductsFromBasket() {
      const next = this.products.map(p => ({ ...p, is_added: false }));
      this.updateBasket(next);
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

    removeProductFromBasket(productId) {
      this.setProductAdded(productId, false);
    },

    async removeProductPermanently(productId) {
      const previous = [...this.products];
      this.products = this.products.filter(p => p.id !== productId);
      this.editQuantityModal = false;
      this.productDetailsId = null;
      this.persistProductsToLocalStorage();

      try {
        const response = await apiClient.post(`/api/basket/${this.currentBasket}/remove-product-permanently`, {
          product_id: productId,
        });
        if (response.data.success && response.data.products) {
          this.products = response.data.products;
          this.persistProductsToLocalStorage();
        } else {
          throw new Error(response.data?.error || 'Delete failed');
        }
      } catch (error) {
        console.error(error);
        this.products = previous;
        this.persistProductsToLocalStorage();
        toast.error(i18n.global.t("internal-server-error"));
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

    async getBasketProducts(isBackgroundRefresh = false) {
      const generationWhenStarted = this.updateGeneration;
      if (!isBackgroundRefresh) {
        this.hydrateProductsFromLocalStorage(this.currentBasket);
      }

      try {
        const response = await apiClient.get(`/api/basket/${this.currentBasket}`);
        if (this.updateGeneration !== generationWhenStarted) return;
        if (response.data.products && Array.isArray(response.data.products)) {
          this.products = response.data.products;
          this.persistProductsToLocalStorage();
        } else if (isBackgroundRefresh) {
          this._setSyncStatus('error');
        }
      } catch (error) {
        console.error(error);
        if (this.updateGeneration === generationWhenStarted && isBackgroundRefresh) {
          this._setSyncStatus('error');
        }
      }
    },

    openEditQuantityModal(productId) {
      this.productDetailsId = productId;
      this.editQuantityModal = true;
    },

    closeEditQuantityModal(newQuantity) {
      this.editQuantityModal = false;
      const product = this.products.find(p => p.id === this.productDetailsId);
      if (newQuantity === product?.quantity) {
        this.productDetailsId = null;
        return;
      }
      if (product) {
        this.setProductQuantity(this.productDetailsId, newQuantity);
      }
      this.productDetailsId = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(basket, import.meta.hot));
}
