import { defineConfig } from "vite";
import { URL, fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    Components({
      dirs: ["app/components"],
      resolvers: [
        IconsResolver({
          prefix: "",
        }),
      ],
    }),
    Icons(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
});
