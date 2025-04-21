import { resolve } from "node:path";
import html from "@rollup/plugin-html";
import { defineConfig } from "vite";

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

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/main.ts"),
			name: toPascalCase(baseName),
			formats: ["iife"],
			fileName: () => `${baseName}.js`,
		},
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) =>
					assetInfo.names?.some((name) => name.endsWith(".css"))
						? `${baseName}.css`
						: (assetInfo.names?.[0] ?? "assets/[name]-[hash][extname]"),
			},
			plugins: [
				html({
					fileName: outputHtmlName,
					template: ({ bundle }) => {
						// Inline all CSS assets
						const css = Object.values(bundle)
							// Filter for assets and check filename, removing type predicate
							.filter(
								(chunkOrAsset) =>
									chunkOrAsset.type === "asset" &&
									chunkOrAsset.fileName.endsWith(".css"),
							)
							.map((asset) =>
								asset.type === "asset" ? `<style>${asset.source}</style>` : "",
							);

						// Inline the JS entry chunk
						const js = Object.values(bundle)
							// Filter for chunks and check if it's an entry point, removing type predicate
							.filter(
								(chunkOrAsset) =>
									chunkOrAsset.type === "chunk" && chunkOrAsset.isEntry,
							)

							.map((chunk) =>
								chunk.type === "chunk" ? `<script>${chunk.code}</script>` : "",
							); // Added check before accessing code

						// Join the arrays into strings
						return `${css.join("\n")}\n${js.join("\n")}`; // Added join for potentially multiple files
					},
				}),
			],
		},
		cssCodeSplit: !buildSeparateCSS,
	},
});
