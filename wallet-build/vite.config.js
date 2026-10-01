import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build-time only. Compiles src/presale-connect.js (Reown AppKit + ethers)
// into a single self-contained browser bundle, written straight into the
// site root as presale-connect.bundle.js. The deployed site stays plain
// static HTML/CSS/JS — t5d-presale.html just adds one more
// <script src="presale-connect.bundle.js"> tag. This folder itself
// (wallet-build/, including node_modules) is not part of the deployed
// site and does not need to be pushed to GitHub Pages, though committing
// it to git is fine (GitHub Pages ignores it — it only serves the HTML/
// CSS/JS at the repo root).
export default defineConfig({
  build: {
    outDir: '../',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/presale-connect.js'),
      name: 'T5DPresaleConnect',
      formats: ['iife'],
      fileName: () => 'presale-connect.bundle.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
