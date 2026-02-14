import { rm, mkdir, readdir, copyFile, stat, access, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Cleans a directory by removing it and all its contents, then recreating it.
 * @param {string} directory - The path to the directory to clean.
 */
export async function cleanDirectory(directory) {
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
}

/**
 * Recursively copies a directory and its contents to a destination.
 * @param {string} source - The path to the source directory.
 * @param {string} destination - The path to the destination directory.
 */
export async function copyDirectory(source, destination) {
    await mkdir(destination, { recursive: true });

    const entries = await readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = join(source, entry.name);
        const destinationPath = join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath);
        } else {
            await copyFile(sourcePath, destinationPath);
        }
    }
}

/**
 * Recursively gets all files in a directory, returning their relative paths and sizes.
 * @param {string} directory - The path to the directory to scan.
 * @param {string} [base=directory] - The base directory to calculate relative paths from.
 * @returns {Promise<Array<{path: string, size: number}>>} A promise that resolves to an array of file objects.
 */
export async function getFilesRecursive(directory, base = directory) {
    const files = [];
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            const nested = await getFilesRecursive(fullPath, base);
            files.push(...nested);
        } else {
            const fileStats = await stat(fullPath);
            files.push({
                path: relative(base, fullPath),
                size: fileStats.size,
            });
        }
    }

    return files;
}

/**
 * Checks if a file or directory exists at the given path.
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>} True if the file/directory exists, false otherwise.
 */
export async function fileExists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Injects the live-reload client code into the background service worker.
 * @param {string} distributionDirectory - The path to the distribution directory.
 */
export async function injectLiveReloadCode(distributionDirectory) {
    const backgroundScriptPath = join(distributionDirectory, "background", "index.js");
    const liveReloadClientSource = join(__dirname, "..", "utils", "live-reload-client.js");

    try {
        const backgroundScriptContent = await readFile(backgroundScriptPath, "utf-8");
        const liveReloadClientContent = await readFile(liveReloadClientSource, "utf-8");
        await writeFile(backgroundScriptPath, liveReloadClientContent + '\n' + backgroundScriptContent);
    } catch (error) {
        logger.error(`Could not inject live reload client: ${error.message} `);
    }
}
