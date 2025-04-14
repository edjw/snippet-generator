# Snippet Generator

This project uses Vite to bundle TypeScript and CSS into a single, self-contained HTML snippet (`inline-snippet.html`). This snippet contains all necessary CSS and JavaScript inline, making it easy to embed directly into Content Management Systems (CMS) or other platforms where external file references might be difficult or undesirable. It also includes an optional feature to automatically upload the generated snippet to a GitHub Gist for easy sharing and versioning.

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
- **`pnpm upload-gist`**: Uploads the built `dist/inline-snippet.html` to a GitHub Gist (requires setup, see below).

## GitHub Gist Upload (Optional)

This project includes a script to upload the generated `dist/inline-snippet.html` to a GitHub Gist. This can be useful for sharing the snippet or keeping a version history.

### Setup

1.  **Generate GitHub Token:**

    - You need a GitHub Fine-Grained token with 'gist' account permissions
    - Generate one here: https://github.com/settings/personal-access-tokens/new

    - Copy the generated token immediately – you won't be able to see it again.

2.  **Create `.env` File:**

    - Create a file named `.env` in the project root directory.
    - Add the following line, replacing `YOUR_TOKEN_HERE` with the token you just generated:
      ```
      GITHUB_GIST_TOKEN=YOUR_TOKEN_HERE
      ```
    - The `.env` file is already listed in `.gitignore` to prevent accidental commits.

3.  **Create `gist-config.json`:**

    - Copy the example configuration file:
      ```bash
      cp gist-config.json.example gist-config.json
      ```
    - Edit the newly created `gist-config.json` and fill in the required details:
      - `gistId`: Leave this as `""` or `null`. The upload script will automatically populate it after the first successful upload. If you already have a Gist you want to update, you can paste its ID here.
      - `description`: Provide a meaningful description for your Gist (e.g., "My CMS Snippet").
      - `public`: Set to `true` if you want the Gist to be publicly accessible, `false` for a secret Gist.
      - `uploadFiles`: Verify that the `sourcePath` points to the correct build output (usually `dist/inline-snippet.html`) and `gistFilename` is the desired name for the file within the Gist.
    - This file is listed in `.gitignore` as the `gistId` and potentially other details are specific to your Gist.

4.  **Understanding `gist-config.json`:**
    - A `gist-config.json` file exists in the project root. It controls the upload behavior:
      ```json
      {
        "gistId": "", // Will be auto-filled after the first successful upload, or set manually
        "description": "Snippet Build Output", // Description for the Gist (optional)
        "public": false, // Set to true to create a public Gist
        "uploadFiles": [
          // Array defining files to upload
          {
            // Explicitly defines the filename to use within the Gist
            "gistFilename": "snippet.html",
            // Path to the local file to upload
            "sourcePath": "dist/inline-snippet.html"
          }
          // You could add more file objects here if needed
        ]
      }
      ```
    - The upload script (`pnpm upload-gist`) uses this configuration to determine which Gist to update (or create), its description, visibility, and which local files map to which filenames within the Gist.

### Usage

1.  Build the project:
    ```bash
    pnpm build
    ```
2.  Run the upload script:
    ```bash
    pnpm upload-gist
    ```
    - The first time you run this, it will create a new Gist and save its ID to `gist-config.json`.
    - Subsequent runs will update the _same_ Gist with the latest build output.

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
