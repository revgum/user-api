import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@user-api/core/*": path.resolve(__dirname, "../core/src/*"),
    },
  },
});
