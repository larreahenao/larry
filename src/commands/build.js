import { join } from "node:path";
import { writeFile, access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { logger } from "../utils/logger.js";
import { cleanDirectory, copyDirectory, getFilesRecursive } from "../utils/filesystem.js";
import { createZip } from "../utils/zip.js";

export async function build() {
    const root = process.cwd();
    const sourceDirectory = join(root, "src");
    const distDirectory = join(root, "dist");

    logger.newLine();

    const configPath = join(root, "larrix.config.js");
    const configUrl = pathToFileURL(configPath).href;
    const { default: config } = await import(configUrl);

    logger.step("build", "Cleaning dist...");
    await cleanDirectory(distDirectory);

    logger.step("build", "Copying source files...");
    await copyDirectory(sourceDirectory, distDirectory);

    logger.newLine();

    const files = await getFilesRecursive(distDirectory);
    for (const file of files) {
        logger.file(`dist/${file.path}`, formatSize(file.size));
    }

    logger.newLine();
    logger.step("build", "Generating manifest.json...");

    const manifest = await generateManifest(config, sourceDirectory);
    const manifestContent = JSON.stringify(manifest, null, 4);
    await writeFile(join(distDirectory, "manifest.json"), manifestContent);

    logger.newLine();
    logger.file("dist/manifest.json", formatSize(Buffer.byteLength(manifestContent)));

    logger.newLine();
    logger.step("build", "Creating zip...");

    const zipName = `${config.name}-${config.version}.zip`;
    const zipPath = join(root, zipName);
    const zipSize = await createZip(distDirectory, zipPath);

    logger.newLine();
    logger.file(zipName, formatSize(zipSize));

    logger.newLine();
    logger.success("Build completed successfully");
    logger.newLine();
}

async function generateManifest(config, sourceDirectory) {
    const manifest = {
        manifest_version: 3,
        name: config.name,
        version: config.version,
        ...config.manifest,
    };

    if (await exists(join(sourceDirectory, "background", "index.js"))) {
        manifest.background = {
            service_worker: "background/index.js",
        };
    }

    if (await exists(join(sourceDirectory, "content", "index.js"))) {
        manifest.content_scripts = [
            {
                matches: ["<all_urls>"],
                js: ["content/index.js"],
            },
        ];
    }

    if (await exists(join(sourceDirectory, "popup", "index.html"))) {
        manifest.action = {
            default_popup: "popup/index.html",
        };
    }

    return manifest;
}

async function exists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} kB`;
}