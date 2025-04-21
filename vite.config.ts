import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
    allowedHosts: ["localhost", "127.0.0.1", "ovocard.vercel.app", "abcfc797db4e5f.lhr.life"],
  },
});
