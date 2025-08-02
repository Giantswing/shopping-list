import { createI18n } from "vue-i18n";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

export default createI18n({
   locale: navigator.language.split('-')[0],
   fallbackLocale: "en",

   messages: {
      es,
      en,
   },

   warnHtmlMessage: false,
   warnHtmlInMessage: 'off',
   silentTranslationWarn: true,
   fallbackWarn: false,
   missingWarn: false,
   globalInjection: true,
});
