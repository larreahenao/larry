# SPEC: Dev Command Module

## 1. Module Description

This document describes the specifications for the `dev` command module in the Larrix project. The `dev` command starts a development server for the Larrix project, enabling live reloading for a smoother development experience. It performs an initial build, serves the built files, watches for changes in the source directory, and triggers live reloads in the browser extension via Server-Sent Events (SSE).

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions and Classes

The `dev` command module primarily consists of the asynchronous function `dev()` that orchestrates the development server and live reloading process, along with several helper functions.

### `dev()` Function

The `dev()` function is the main entry point for the development command. It orchestrates the development process:
*   **Project Validation:** As the very first step before running any other code, validates that the current directory is a valid Larrix project by checking for the presence of `larrix.config.js`. If not found, it will issue a warning ("This is not a valid Larrix project. 'larrix.config.js' not found in the current directory.") and exit the process, stopping all further execution.
*   Sets up source and distribution directory paths.
*   Performs an initial build by calling `buildAndInject()`.
*   Creates a `devServerContext` object to share state between the server and the file watcher.
*   Calls `startDevelopmentServer()` to start the HTTP server.
*   Calls `watchSourceFiles()` to start watching for file changes.
*   Sets up a `SIGINT` (Ctrl+C) handler to gracefully shut down the server and the watcher.

### `buildAndInject(distributionDirectory)`

*   Runs the core build process by calling `buildExtension({ outputDirectory: "dist", createZip: false, quiet: true })` from `core/utils/extension-service.js`.
*   Calls `injectLiveReloadCode()` to inject the live-reload client into the background script.

### `injectLiveReloadCode(distributionDirectory)`

*   Reads the content of the background service worker (`background/index.js`) and the live-reload client script (`core/utils/live-reload-client.js`).
*   Prepends the live-reload client code to the background script, ensuring it runs in the extension's context.

### `regenerateManifest(sourceDirectory, distributionDirectory)`

*   Loads the project's configuration (using `loadConfiguration` from `core/utils/extension-service.js`).
*   Generates a new `manifest.json` file based on the current configuration and source files (using `generateManifest` from `core/utils/extension-service.js`).
*   Writes the updated manifest to the `distributionDirectory`.

### `startDevelopmentServer(context)`

*   Creates an HTTP server using Node.js's built-in `http` module.
*   Handles `OPTIONS` requests for the `/events` endpoint to support Cross-Origin Resource Sharing (CORS).
*   If the request URL is `/events`, it sets up a Server-Sent Events (SSE) connection. The response object is added to the `context.clients` array, and CORS headers are included.
*   For all other requests, it calls `serveStaticFile()` to serve the requested file.
*   The server listens on `http://localhost:3000`.

### `serveStaticFile(requestUrl, distributionDirectory, response)`

*   Serves a static file from the `distributionDirectory`.
*   If the `requestUrl` is `/`, it redirects to `/popup/`.
*   It determines the file's content type based on its extension (.html, .js, .css, .json) and sends the file content with the appropriate headers.
*   If a file is not found, it returns a 404 error.

### `watchSourceFiles(sourceDirectory, context)`

*   Watches the `sourceDirectory` for file changes using Node.js's built-in `fs.watch` with the `recursive` option.
*   When a file is added or changed, it copies the file to the corresponding location in the `dist` directory.
*   When a file is deleted, it removes the file from the `dist` directory.
*   After any file change, it calls `regenerateManifest()` to ensure the manifest is up-to-date.
*   If the changed file is part of the background script, it calls `injectLiveReloadCode()` again.
*   Finally, it sends a "reload" event to all connected SSE clients, triggering the extension to reload.

### Client-Side Live Reload (`core/utils/live-reload-client.js`)

*   A client-side script that is injected into the extension's background service worker during development builds.
*   It establishes an SSE connection to `http://localhost:3000/events`.
*   When it receives a "reload" message, it calls `chrome.runtime.reload()` to reload the extension.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC for the `dev` command itself:

*   **Detailed Build Configuration:** The `dev` command does not expose direct configuration options. The granular build configuration (e.g., entry points, transformations) is managed internally by the `extension-service` module and potentially `larrix.config.js`.
*   **Browser Compatibility Beyond Chrome:** The live reload mechanism and extension reloading (`chrome.runtime.reload()`) are specific to Chrome.
*   **Advanced File Watching:** Basic recursive watching is implemented. More advanced features like debouncing or specific file type filtering are not covered directly by the `dev` command's watcher.
*   **Server-Side Logic for Live Reload:** The `dev` command provides the SSE endpoint but does not specify its internal implementation details beyond its HTTP handling.
*   **Error Recovery in Watcher:** While some errors are logged, robust error recovery or retry mechanisms for file system operations within the watcher are not included.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/commands/dev.md` (this file, for its updates).
*   `core/cli/commands/dev.js` (the source code file for the dev command).
*   `core/utils/extension-service.js` (provides project validation, configuration loading, manifest generation, and core build logic).
*   `core/utils/live-reload-client.js` (the script injected for client-side live reload).
*   `core/utils/logger.js` (used for all console output).
*   `larrix.config.js` (project configuration loaded by `buildExtension`).

## 6. Edge Cases

The following edge cases must be considered:

*   **`buildExtension` Failures:** Any internal errors or failures within the `buildExtension` utility (e.g., compilation errors, module resolution issues, file system access problems during the build process) will cause the `dev` command to fail.
*   **Server Connection Issues:** If the SSE client in the extension cannot connect to the development server (e.g., due to port conflicts, network issues), live reloading will not function.
*   **File System Permissions:** Lack of write permissions for the `tmp` directory or read permissions for source files will cause failures.
*   **Rapid File Changes:** Numerous rapid file changes might overwhelm the watcher or lead to inefficient rebuilds/reloads.
*   **`chrome.runtime.reload()` Unavailable:** If the injected script runs in an environment where `chrome.runtime.reload()` is not available, a warning is logged, and the extension will not automatically reload.
*   **Graceful Shutdown:** Ensuring the server and watcher are properly closed on `SIGINT` (Ctrl+C) is critical to prevent orphaned processes.
