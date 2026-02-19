import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite configuration for building the isolated-renderer bundle.
 *
 * This creates a single IIFE bundle that can be:
 * 1. Imported as a string
 * 2. Sent to an isolated iframe via postMessage eval
 * 3. Self-executes to initialize the React renderer
 *
 * The bundle includes React and all dependencies inline.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "../..")}/`,
    },
  },
  build: {
    // Output as a library in IIFE format (self-executing)
    lib: {
      entry: path.resolve(__dirname, "index.tsx"),
      name: "IsolatedRenderer",
      formats: ["iife"],
      fileName: () => "isolated-renderer.js",
    },
    outDir: path.resolve(__dirname, "../../public/isolated"),
    emptyOutDir: true,
    // Inline all dependencies (don't externalize anything)
    rollupOptions: {
      output: {
        // Ensure everything is in one file
        inlineDynamicImports: true,
        // Control asset naming (for CSS)
        assetFileNames: "isolated-renderer.[ext]",
      },
    },
    // Don't minify for easier debugging (can enable in production)
    minify: false,
    // Generate source maps for debugging
    sourcemap: true,
  },
  // Define to help with React production build
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
