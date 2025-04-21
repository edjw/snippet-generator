import { writeFile } from "fs/promises";
import { resolve } from "path";
import { z } from "zod";
import { gistConfigSchema } from "./gistConfigSchema";

async function generateJsonSchema() {
  console.log("Generating JSON schema from Zod schema...");

  try {
    // Generate JSON Schema using Zod 4's native function
    let jsonSchema: any = z.toJSONSchema(gistConfigSchema); // Use 'any' for flexibility

    // Add top-level properties manually
    jsonSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Gist Configuration",
      description: "Configuration for uploading files to a GitHub Gist.",
      ...jsonSchema,
    };

    const schemaPath = resolve(process.cwd(), "gist-config.schema.json");

    // Write the schema to the file
    await writeFile(schemaPath, JSON.stringify(jsonSchema, null, 2), "utf-8");

    console.log(`Successfully generated and saved schema to ${schemaPath}`);
  } catch (error) {
    console.error("Error generating JSON schema:", error);
    process.exit(1);
  }
}

// Run the generation function
generateJsonSchema();
