import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from "node:url";
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),

    Components({
      resolvers: [
        IconsResolver(),
      ],
    }),
    Icons(),
  ],

  preview: {
    port: 5173,
  },

  base: "/",

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    headers: {
      'Document-Policy': 'js-profiling'
    },
    hmr: {
      host: 'localhost',
      overlay: true,
    },
  },


});
