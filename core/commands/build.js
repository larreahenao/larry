import { buildExtension, validateLarrixProject } from "../utils/extension-service.js";

/**
 * Builds the browser extension for production.
 * This command utilizes the buildExtension function to compile and package the extension,
 * including creating a distributable ZIP archive.
 */
export async function build() {
    const currentWorkingDirectory = process.cwd();
    validateLarrixProject(currentWorkingDirectory); // Perform project validation first
    await buildExtension({
        outputDirectory: "dist",
        createZip: true,
    });
}
