import { join, dirname } from "node:path";
import { watch } from "node:fs";
import { createServer, ServerResponse } from "node:http";
import { readFile, rm, copyFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildExtension, validateLarrixProject, regenerateManifest } from "../utils/extension-service.js";
import { logger } from "../utils/logger.js";
import { injectLiveReloadCode } from "../utils/filesystem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIRECTORY = "dist";
const SERVER_PORT = 3000;
const EVENTS_ENDPOINT = "/events";

const CONTENT_TYPE_HTML = "text/html";
const CONTENT_TYPE_JAVASCRIPT = "application/javascript";
const CONTENT_TYPE_CSS = "text/css";
const CONTENT_TYPE_JSON = "application/json";
const CONTENT_TYPE_OCTET_STREAM = "application/octet-stream";

/**
 * @typedef {object} DevServerContext
 * @property {ServerResponse[]} clients - Array of ServerResponse objects for SSE clients.
 * @property {string} distributionDirectory - The path to the distribution directory.
 */

/**
 * Runs the build process and injects the live-reload code.
 * @param {string} distributionDirectory - The path to the distribution directory.
 */
async function buildAndInject(distributionDirectory) {
    await buildExtension({
        outputDirectory: OUTPUT_DIRECTORY,
        createZip: false,
        quiet: true,
    });
    logger.step("dev", "Build completed.");
    await injectLiveReloadCode(distributionDirectory);
}

/**
 * Starts a development server for the Larrix project with live reloading.
 * It performs an initial build, serves the built files, watches for changes
 * in the source directory, and triggers live reloads in the browser extension
 * via Server-Sent Events (SSE).
 */
export async function dev() {
    const currentWorkingDirectory = process.cwd();
    validateLarrixProject(currentWorkingDirectory); // Perform project validation first

    const sourceDirectory = join(currentWorkingDirectory, "src");
    const distributionDirectory = join(currentWorkingDirectory, OUTPUT_DIRECTORY);

    logger.step("dev", "Performing initial build...");
    await buildAndInject(distributionDirectory);

    /** @type {DevServerContext} */
    const devServerContext = {
        clients: [],
        distributionDirectory: distributionDirectory,
    };

    const server = startDevelopmentServer(devServerContext);
    const watcher = watchSourceFiles(sourceDirectory, devServerContext);

    process.on("SIGINT", () => {
        logger.step("dev", "Stopping development server...");
        watcher.close();
        devServerContext.clients.forEach(client => {
            client.end();
        });
        server.close(() => {
            logger.newLine();
            logger.warn("Development server stopped.");
            logger.newLine();
            process.exit(0);
        });
    });
}
/**
 * Creates and starts the HTTP server for development.
 * @param {DevServerContext} context - The development server context.
 * @returns {import('node:http').Server} The created HTTP server instance.
 */
function startDevelopmentServer(context) {
    const server = createServer(async (request, response) => {
        logger.step("dev", `Request: ${request.method} ${request.url} `);
        if (request.url === EVENTS_ENDPOINT) {
            if (request.method === "OPTIONS") {
                response.writeHead(204, { // No Content
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Connection": "keep-alive"
                });
                response.end();
                return;
            }
            logger.info("Events endpoint hit");
            response.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            });
            context.clients.push(response);
            request.on("close", () => {
                context.clients.splice(context.clients.indexOf(response), 1);
            });
        } else {
            await serveStaticFile(request.url, context.distributionDirectory, response);
        }
    });

    server.listen(SERVER_PORT, () => {
        logger.step("dev", `Development server started on http://localhost:${SERVER_PORT}`);
        logger.newLine();
    });

    return server;
}

/**
 * Serves a static file from the distribution directory.
 * @param {string} requestUrl - The URL of the requested file.
 * @param {string} distributionDirectory - The path to the distribution directory.
 * @param {ServerResponse} response - The HTTP response object.
 */
async function serveStaticFile(requestUrl, distributionDirectory, response) {
    if (requestUrl === "/") {
        response.writeHead(302, { "Location": "/popup/" });
        response.end();
        return;
    }

    let filePath = join(distributionDirectory, requestUrl);

    if (requestUrl.endsWith("/")) {
        filePath = join(filePath, "index.html");
    }

    try {
        const fileContent = await readFile(filePath);
        let contentType = CONTENT_TYPE_OCTET_STREAM;
        if (filePath.endsWith(".html")) contentType = CONTENT_TYPE_HTML;
        else if (filePath.endsWith(".js")) contentType = CONTENT_TYPE_JAVASCRIPT;
        else if (filePath.endsWith(".css")) contentType = CONTENT_TYPE_CSS;
        else if (filePath.endsWith(".json")) contentType = CONTENT_TYPE_JSON;

        response.writeHead(200, { "Content-Type": contentType });
        response.end(fileContent);
    } catch (error) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Not Found");
        logger.error(`Error serving file ${filePath}: ${error.message}`);
    }
}

/**
 * Watches the source directory for file changes and triggers rebuilds.
 * @param {string} sourceDirectory - The path to the source directory.
 * @param {DevServerContext} context - The development server context.
 * @returns {import('node:fs').FSWatcher} The file watcher instance.
 */
function watchSourceFiles(sourceDirectory, context) {
    logger.step("dev", "Watching for file changes in src directory...");
    const watcher = watch(sourceDirectory, { recursive: true }, async (eventType, filename) => {
        if (filename) {
            const sourcePath = join(sourceDirectory, filename);
            const destPath = join(context.distributionDirectory, filename);

            try {
                await access(sourcePath);
                // File exists, so it was added or changed
                logger.info(`File changed: ${filename}`);
                await mkdir(dirname(destPath), { recursive: true });
                await copyFile(sourcePath, destPath);
                logger.info(`Copied ${filename} to ${OUTPUT_DIRECTORY}.`);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // File does not exist in src, so it was deleted
                    logger.info(`File deleted: ${filename}`);
                    try {
                        await rm(destPath, { recursive: true, force: true });
                        logger.info(`Deleted ${filename} from ${OUTPUT_DIRECTORY}.`);
                    } catch (deleteError) {
                        if (deleteError.code !== 'ENOENT') {
                            logger.error(`Failed to delete ${filename}: ${deleteError.message}`);
                        }
                    }
                } else {
                    logger.error(`Error handling file change for ${filename}: ${error.message}`);
                }
            }

            // Regenerate manifest after every change
            await regenerateManifest(sourceDirectory, context.distributionDirectory);

            // If the changed file was the background script, we need to re-inject the live reload client
            if (filename.includes("background")) {
                await injectLiveReloadCode(context.distributionDirectory);
            }

            context.clients.forEach(client => {
                client.write("event: reload\n");
                client.write("data: files changed, reloading...\n\n");
            });
        }
    });

    return watcher;
}
