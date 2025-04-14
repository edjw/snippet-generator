# CMS Snippet Vite

This project uses Vite to bundle TypeScript and CSS into a single, self-contained HTML snippet (`inline-snippet.html`). This snippet contains all necessary CSS and JavaScript inline, making it easy to embed directly into Content Management Systems (CMS) or other platforms where external file references might be difficult or undesirable.

## Installation

1.  Clone the repository (if applicable).
2.  Navigate to the project directory.
3.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```

## Available Scripts

- **`pnpm dev`**: Starts the Vite development server for local development and testing with hot module replacement.
- **`pnpm build`**: Compiles the TypeScript code, bundles the application using Vite, and runs the custom plugin to generate the final `dist/inline-snippet.html`.
- **`pnpm preview`**: Serves the production build locally to preview the final output.

## Build Output

The primary output of the build process (`pnpm build`) is:

- **`dist/inline-snippet.html`**: A single HTML file containing all the necessary CSS (within `<style>` tags) and JavaScript (within `<script>` tags) for the snippet. This is the file intended for embedding into a CMS.
- Intermediate files (`dist/snippet.js`, `dist/snippet.css` if `cssCodeSplit` is false, or multiple CSS chunks if true) are also generated but are primarily used by the custom plugin to create the final inline HTML.

## Project Structure

- **`src/`**: Contains the source code for the snippet.
  - **`main.ts`**: The main entry point for the application. It imports styles and feature modules.
  - **`style.css`**: Global CSS styles (use with caution in shared CMS environments).
  - **`features/`**: Directory containing modular features. Each feature might have its own TypeScript file (`.ts`) and CSS module (`.module.css`).
  - **`vite-env.d.ts`**: TypeScript definitions for Vite environment variables.
- **`vite.config.ts`**: Vite configuration file, including the custom plugin (`generate-inline-html`) responsible for creating the final HTML snippet.
- **`package.json`**: Project metadata, dependencies, and scripts.
- **`tsconfig.json`**: TypeScript compiler configuration.

## Custom Build Logic

This project utilizes a custom Vite plugin (`generate-inline-html` defined in `vite.config.ts`) that runs after the standard Vite build (`closeBundle` hook). This plugin:

1.  Reads the generated JavaScript bundle (`dist/snippet.js`).
2.  Reads the generated CSS. It handles both single CSS files (when `cssCodeSplit` is `false`) and multiple CSS chunks (when `cssCodeSplit` is `true` - the current setting) by concatenating them.
3.  Combines the CSS and JavaScript content into a single HTML structure (`<style>...</style><script>...</script>`).
4.  Writes this combined content to `dist/inline-snippet.html`.

This ensures the final output is a single, easy-to-deploy file.
