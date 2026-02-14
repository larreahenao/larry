import { join } from "node:path";
import { writeFile, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { logger } from "./logger.js";
import { cleanDirectory, copyDirectory, getFilesRecursive, fileExists } from "./filesystem.js";
import { createZip } from "./zip.js";

/**
 * Validates if the current directory is a valid Larrix project by checking
 * for the presence of 'larrix.config.js'. If the file is not found, it logs
 * a warning message and exits the process. This function uses a synchronous
 * file check as it's a critical initial validation.
 * @param {string} currentWorkingDirectory - The path to the current working directory.
 */
export function validateLarrixProject(currentWorkingDirectory) {
    const configPath = join(currentWorkingDirectory, "larrix.config.js");
    if (!existsSync(configPath)) {
        logger.warn("This is not a valid Larrix project. 'larrix.config.js' not found in the current directory.");
        process.exit(1);
    }
}

/**
 * Loads the Larrix project configuration from 'larrix.config.js' in the current
 * working directory. It dynamically imports the configuration file.
 * @returns {Promise<object>} A promise that resolves to the project configuration object.
 */
export async function loadConfiguration() {
    const currentWorkingDirectory = process.cwd();
    const configurationPath = join(currentWorkingDirectory, "larrix.config.js");
    const configurationUrl = pathToFileURL(configurationPath).href;
    const { default: configuration } = await import(configurationUrl);
    return configuration;
}

/**
 * Executes the core build process for the Larrix project.
 * This function handles loading configuration, cleaning output directories,
 * copying source files, generating the manifest, and optionally creating a ZIP archive.
 *
 * @param {object} options - The build options.
 * @param {string} options.outputDirectory - The name of the output directory (e.g., 'dist', 'tmp').
 * @param {boolean} options.createZip - Whether to create a ZIP archive of the build output.
 * @param {boolean} [options.quiet=false] - If true, suppresses console output during the build process.
 */
export async function buildExtension(options) {
    const { outputDirectory, createZip: shouldCreateZip, quiet = false } = options;
    logger.setQuiet(quiet);

    const currentWorkingDirectory = process.cwd();
    const sourceDirectory = join(currentWorkingDirectory, "src");
    const distributionDirectory = join(currentWorkingDirectory, outputDirectory);

    logger.newLine();

    const configuration = await loadConfiguration();

    logger.step("build", `Cleaning ${outputDirectory}...`);
    await cleanDirectory(distributionDirectory);

    logger.step("build", "Copying source files...");
    await copyDirectory(sourceDirectory, distributionDirectory);

    logger.newLine();
    const files = await getFilesRecursive(distributionDirectory);
    for (const file of files) {
        logger.file(`${outputDirectory}/${file.path}`, logger.formatSize(file.size));
    }

    logger.newLine();
    logger.step("build", "Generating manifest.json...");

    const manifest = await generateManifest(configuration, sourceDirectory);
    const manifestContent = JSON.stringify(manifest, null, 4);
    await writeFile(join(distributionDirectory, "manifest.json"), manifestContent);

    logger.newLine();
    logger.file(`${outputDirectory}/manifest.json`, logger.formatSize(Buffer.byteLength(manifestContent)));

    if (shouldCreateZip) {
        logger.newLine();
        logger.step("build", "Creating zip...");

        const zipName = `${configuration.name}-${configuration.version}.zip`;
        const zipPath = join(currentWorkingDirectory, zipName);
        const zipSize = await createZip(distributionDirectory, zipPath);

        logger.newLine();
        logger.file(zipName, logger.formatSize(zipSize));
    }

    logger.newLine();
    logger.success("Build completed successfully");
    logger.newLine();

    logger.setQuiet(false); // Reset logger to default state
}

/**
 * Generates the manifest.json content based on the project configuration, source directory, and output directory.
 * @param {object} configuration - The project configuration from larrix.config.js.
 * @param {string} sourceDirectory - The path to the source directory.
 * @returns {Promise<object>} The generated manifest object.
 */
export async function generateManifest(configuration, sourceDirectory) {
    const manifest = {
        manifest_version: 3,
        name: configuration.name,
        version: configuration.version,
        ...configuration.manifest,
    };

    if (await fileExists(join(sourceDirectory, "background", "index.js"))) {
        manifest.background = {
            service_worker: "background/index.js",
        };
    }

    if (await fileExists(join(sourceDirectory, "content", "index.js"))) {
        manifest.content_scripts = [
            {
                matches: ["<all_urls>"],
                js: ["content/index.js"],
            },
        ];
    }

    if (await fileExists(join(sourceDirectory, "popup", "index.html"))) {
        manifest.action = {
            default_popup: "popup/index.html",
        };
    }

    return manifest;
}

export async function regenerateManifest(sourceDirectory, distributionDirectory) {
    const configuration = await loadConfiguration();
    const manifest = await generateManifest(configuration, sourceDirectory);
    const manifestContent = JSON.stringify(manifest, null, 4);
    await writeFile(join(distributionDirectory, "manifest.json"), manifestContent);
}
