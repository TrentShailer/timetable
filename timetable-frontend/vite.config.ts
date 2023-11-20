import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function manualChunks(id) {
  if (id.includes("node_modules")) {
    if (id.includes("@chakra-ui")) {
      return "vendor_chakra-ui";
    }
    if (id.includes("axios")) {
      return "vendor_axios";
    }
    if (id.includes("react-dom")) {
      return "vendor_react-dom";
    }
    if (id.includes("react")) {
      return "vendor_react";
    }

    return "vendor";
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: manualChunks,
      },
    },
  },
});
