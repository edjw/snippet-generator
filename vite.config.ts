import { defineConfig, PluginOption, ResolvedConfig } from "vite";
import { resolve } from "path";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";

// --- Configuration ---
const baseName = "snippet";
const outputHtmlName = "inline-snippet.html";
const buildSeparateCSS = false;

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
  let isCssSplittingEnabled: boolean;

  return {
    name: "generate-inline-html",
    // Get the output directory and cssCodeSplit setting from the resolved config
    configResolved(resolvedConfig: ResolvedConfig) {
      outDir = resolvedConfig.build.outDir || "dist";
      isCssSplittingEnabled = resolvedConfig.build.cssCodeSplit ?? false;
    },
    // Hook that runs after the bundle is generated
    async closeBundle() {
      try {
        let cssContent = "";
        const jsPath = resolve(outDir, `${baseName}.js`);

        // Read CSS content based on cssCodeSplit setting
        if (isCssSplittingEnabled) {
          // Scan the output directory for CSS files
          const files = await readdir(outDir);
          const cssFiles = files.filter((file) => file.endsWith(".css"));
          // Read and concatenate content from all CSS files
          const cssPromises = cssFiles.map((file) =>
            readFile(resolve(outDir, file), "utf-8")
          );
          const cssContents = await Promise.all(cssPromises);
          cssContent = cssContents.join("\n");
        } else {
          // Read the single CSS file if splitting is disabled
          const cssPath = resolve(outDir, `${baseName}.css`);
          cssContent = await readFile(cssPath, "utf-8");
        }

        // Read the content of the generated JS file
        const jsContent = await readFile(jsPath, "utf-8");

        // Check if there is actual CSS content (trim whitespace)
        const hasCssContent = cssContent.trim().length > 0;

        // Create the HTML content conditionally
        let htmlContent = "";
        if (hasCssContent) {
          htmlContent += `<style>
  ${cssContent}</style>
`;
        }
        // Always add the script tag
        htmlContent += `<script>
  ${jsContent}</script>
`;

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
      name: toPascalCase(baseName),
      formats: ["iife"],
      fileName: () => `${baseName}.js`,
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

    cssCodeSplit: !buildSeparateCSS, // Enable CSS code splitting
  },
});
