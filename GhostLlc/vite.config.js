import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@stripe/react-stripe-js",
      "@stripe/stripe-js",
      "sonner",
      "browser-image-compression",
    ],
  },
  server: {
    https: {
      key: fs.readFileSync("./certs/key.pem"),
      cert: fs.readFileSync("./certs/cert.pem"),
    },
    port: 5173,
  },
});
