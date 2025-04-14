import { defineConfig, PluginOption } from "vite";
import { resolve } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";

// --- Configuration ---
const baseName = "cms-snippet";
const outputHtmlName = "inline-snippet.html";

// Helper function to convert kebab-case to PascalCase
const toPascalCase = (str: string) =>
  str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

// --- Custom Plugin ---
// Custom plugin to generate inline HTML
const generateInlineHtmlPlugin = (): PluginOption => {
  let outDir: string;
  return {
    name: "generate-inline-html",
    // Get the output directory from the resolved config
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir || "dist";
    },
    // Hook that runs after the bundle is generated
    async closeBundle() {
      try {
        const cssPath = resolve(outDir, `${baseName}.css`);
        const jsPath = resolve(outDir, `${baseName}.js`);

        // Read the content of the generated CSS and JS files
        const cssContent = await readFile(cssPath, "utf-8");
        const jsContent = await readFile(jsPath, "utf-8");

        // Create the HTML content
        const htmlContent = `
  <style>
${cssContent}
  </style>

  <script>
${jsContent}
  </script>`;

        // Define the path for the new HTML file
        const htmlPath = resolve(outDir, outputHtmlName);

        // Ensure the output directory exists (though Vite usually creates it)
        await mkdir(outDir, { recursive: true });

        // Write the HTML file
        await writeFile(htmlPath, htmlContent, "utf-8");

        console.log(`\nGenerated inline HTML snippet: ${outputHtmlName}`);
      } catch (error) {
        console.error(`Error generating ${outputHtmlName}:`, error);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Add the custom plugin here
    generateInlineHtmlPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: toPascalCase(baseName), // Convert baseName to PascalCase for the library name
      formats: ["iife"],
      fileName: () => `${baseName}.js`, // Use baseName for the JS file
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Force CSS file name to be predictable for the closeBundle hook
          // Check if any associated name ends with .css
          if (assetInfo.names?.some((name) => name.endsWith(".css"))) {
            return `${baseName}.css`; // Use baseName for the CSS file
          }
          // Keep default naming for other assets
          // Use the first name if available, otherwise fallback to the default pattern
          return assetInfo.names?.[0] ?? "assets/[name]-[hash][extname]";
        },
      },
    },

    cssCodeSplit: false,
  },
});
