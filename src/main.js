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

import 'tippy.js/dist/tippy.css';

import "@/assets/style.css";

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


router.isReady().then(() => {
  app.mount("#app");
});
