import { Octokit } from "octokit";
import { Endpoints } from "@octokit/types"; // Added import
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import dotenv from "dotenv";

// --- Types ---
interface GistConfigFile {
  gistFilename: string;
  sourcePath: string;
}

interface GistConfig {
  gistId: string | null;
  description: string;
  public: boolean;
  uploadFiles: GistConfigFile[];
}

// --- Script ---

dotenv.config();

const configPath = resolve(process.cwd(), "gist-config.json");
const token = process.env.GITHUB_GIST_TOKEN;

async function uploadGist() {
  console.log("Starting Gist upload process...");

  // 1. Check for GitHub Token
  if (!token || token === "YOUR_TOKEN_HERE") {
    console.error("Error: GITHUB_GIST_TOKEN is not set in your .env file.");
    console.error(
      "Please generate a Fine-Grained Personal Access Token with 'gist' scope and add it to .env."
    );
    console.error(
      "Generate token: https://github.com/settings/personal-access-tokens/new?scopes=gist"
    );
    process.exit(1);
  }

  // 2. Read Gist Configuration
  let config: GistConfig;
  try {
    const configFileContent = await readFile(configPath, "utf-8");
    config = JSON.parse(configFileContent) as GistConfig;
    console.log("Read gist-config.json successfully.");
  } catch (error) {
    console.error(`Error reading or parsing ${configPath}:`, error);
    process.exit(1);
  }

  // 3. Prepare Files for Upload
  const filesToUpload: { [filename: string]: { content: string } } = {};
  try {
    // Iterate over the uploadFiles array
    for (const fileInfo of config.uploadFiles) {
      const sourcePath = resolve(process.cwd(), fileInfo.sourcePath);
      console.log(`Reading content from: ${sourcePath}`);
      const content = await readFile(sourcePath, "utf-8");
      // Use gistFilename as the key for the API payload
      filesToUpload[fileInfo.gistFilename] = { content };
      console.log(
        `Prepared ${fileInfo.gistFilename} for upload from ${fileInfo.sourcePath}.`
      );
    }
  } catch (error) {
    console.error("Error reading source file content:", error);
    process.exit(1);
  }

  if (Object.keys(filesToUpload).length === 0) {
    console.error(
      "Error: No files specified in the 'uploadFiles' array in gist-config.json."
    );
    process.exit(1);
  }

  // 4. Initialize Octokit
  const octokit = new Octokit({ auth: token });

  // Define response types using Endpoints helper
  type UpdateGistResponse = Endpoints["PATCH /gists/{gist_id}"]["response"];
  type CreateGistResponse = Endpoints["POST /gists"]["response"];

  try {
    let gistId = config.gistId;

    // 5. Check if Gist exists and Create or Update
    if (gistId) {
      // Update existing Gist
      console.log(`Updating existing Gist (ID: ${gistId})...`);
      // Apply specific type to the response
      const response: UpdateGistResponse = await octokit.request(
        "PATCH /gists/{gist_id}",
        {
          gist_id: gistId,
          description: config.description,
          files: filesToUpload,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      console.log(`Gist updated successfully: ${response.data.html_url}`);
    } else {
      // Create new Gist
      console.log("Creating new Gist...");
      // Apply specific type to the response
      const response: CreateGistResponse = await octokit.request(
        "POST /gists",
        {
          description: config.description,
          public: config.public,
          files: filesToUpload,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      // Check if the ID exists before assigning
      if (response.data.id) {
        gistId = response.data.id;
        console.log(`Gist created successfully: ${response.data.html_url}`);
        console.log(`New Gist ID: ${gistId}`);

        // 6. Update config file with the new Gist ID
        config.gistId = gistId;
        try {
          await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
          console.log(`Updated ${configPath} with new Gist ID.`);
        } catch (writeError) {
          console.error(
            `Error writing updated Gist ID to ${configPath}:`,
            writeError
          );
          // Log the error but don't exit, as the Gist was created/updated
        }
      } else {
        // Throw an error if the ID is missing, which shouldn't happen on success
        throw new Error(
          "Gist creation successful, but no Gist ID was returned by the API."
        );
      }
    }
  } catch (error: unknown) {
    console.error("Error interacting with GitHub Gist API:", error);

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404 &&
      config.gistId
    ) {
      console.error(
        `It seems the Gist ID (${config.gistId}) in your gist-config.json is invalid or the Gist was deleted.`
      );
      console.error(
        "Consider removing the gistId from the config file to create a new one."
      );
    } else if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 401
    ) {
      console.error(
        "Authentication failed. Check if your GITHUB_GIST_TOKEN is correct and has the 'gist' scope."
      );
    }
    // Optionally, re-throw or handle other error types if needed
    process.exit(1);
  }
}

// Run the upload function
uploadGist();
