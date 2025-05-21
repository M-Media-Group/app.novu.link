
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // needed for the Docker Container port mapping to work
    proxy: {},
  },
  resolve: {
    alias: {

      '@': path.resolve(__dirname, './src'), // if you're using @ as well
    },
  },
});
