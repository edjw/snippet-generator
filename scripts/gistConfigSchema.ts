import { z } from "zod";

// --- Zod Schema ---
const gistConfigFileSchema = z.object({
	gistFilename: z.string().min(1, "gistFilename cannot be empty").meta({
		description:
			"The desired filename within the Gist. This is also used as the display name for the file in the Gist.",
	}),
	sourcePath: z
		.string()
		.min(1, "sourcePath cannot be empty")
		.meta({ description: "The local path to the source file." }),
});

// Export the main schema
export const gistConfigSchema = z.object({
	// Allow null or a 32-char hex string. Use refine for the hex check.
	gistId: z
		.string()
		.length(32, "gistId must be 32 characters long")
		.regex(/^[a-f0-9]{32}$/, "gistId must be a valid hex string")
		.nullable() // Allow null
		.or(z.literal("")) // Allow empty string, treat as null later
		.meta({
			description:
				"The ID of the GitHub Gist. Should be a 32-character hexadecimal string. Can be left blank or null to automatically populate it after the first successful upload.",
		}),
	description: z.string().meta({ description: "A description for the Gist." }),
	public: z
		.boolean()
		.default(false)
		.meta({ description: "Whether the Gist should be public or private." }),
	uploadFiles: z
		.array(gistConfigFileSchema)
		.min(1, "At least one file must be specified in uploadFiles")
		.meta({ description: "An array of files to upload to the Gist." }),
});

// Infer and export the type as well, useful for consumers
export type GistConfig = z.infer<typeof gistConfigSchema>;
