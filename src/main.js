import App from './App.vue'
import router from "./router";
import { createApp } from 'vue'
import { createPinia } from "pinia";
import i18n from "./includes/i18n";
import fonts from "./includes/fonts";
import VueTippy from 'vue-tippy';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const toastOptions = {
  position: "top-right",
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  containerStyle: {
    zIndex: 10000
  }
};

import 'tippy.js/dist/tippy.css';

import "@/assets/style.css";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered successfully: ', registration);
      })
      .catch((registrationError) => {
        console.error('SW registration failed: ', registrationError);
      });
  });
} else {
  console.log('Service Worker not supported');
}

const pinia = createPinia()
const app = createApp(App);
const env = import.meta.env.VITE_APP_ENV;

app.use(router);
app.use(pinia);
app.use(i18n);
app.component('VueDatePicker', VueDatePicker);
app.use(autoAnimatePlugin);

app.use(VueTippy, {
  defaultProps: { placement: 'top', arrow: true, theme: 'dark', allowHTML: 'true', zIndex: 9999, size: 'large' },
});

app.use(Toast, toastOptions);


router.isReady().then(() => {
  app.mount("#app");
});
