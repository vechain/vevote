/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  return {
    plugins: [nodePolyfills(), react()],
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2
        },
        mangle: {
          safari10: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for optimal caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            'vechain-vendor': ['@vechain/dapp-kit-react', '@vechain/vechain-kit'],
            'query-vendor': ['@tanstack/react-query']
          }
        }
      },
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000
    },
    preview: {
      port: 5001,
      strictPort: true,
    },
    server: {
      port: 5001,
      strictPort: true,
      host: true,
      origin: "http://0.0.0.0:5001",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    //vitest
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: [resolve(__dirname, "test/setup/setup.ts"), resolve(__dirname, "test/setup/resizeObserverMock.ts")],
    },
    base: mode === "production" ? "/vechain-dapp-kit/react/" : "/",
  };
});
