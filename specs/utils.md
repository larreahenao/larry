# Utilities Specification

The `core/utils` directory contains modules with helper functions used across the CLI.

## Core Build (`core/utils/core-build.js`)

Provides the core build logic for the Larrix project.

-   `coreBuild(options)`: Executes the main build process. It takes an `options` object with the following properties:
    -   `outputDirectory` (string): The name of the output directory (e.g., 'dist', 'tmp').
    -   `createZip` (boolean): Whether to create a ZIP archive of the build output.
    -   `quiet` (boolean, optional): If `true`, suppresses console output during the build process.

-   `generateManifest(configuration, sourceDirectory)`: Generates the `manifest.json` content based on the project configuration and the presence of `background`, `content`, and `popup` scripts in the source directory.

-   `loadConfiguration()`: Loads the `larrix.config.js` file from the project root.

-   `fileExists(path)`: Checks if a file or directory exists at the given path.

-   `formatSize(bytes)`: Formats a size in bytes into a human-readable string (e.g., "1.50 kB").

## Filesystem (`core/utils/filesystem.js`)

Provides functions for interacting with the file system.

-   `cleanDirectory(directory)`: Recursively removes and recreates a directory.
-   `copyDirectory(source, destination)`: Recursively copies a directory.
-   `getFilesRecursive(directory, base)`: Returns a flat list of all files in a directory, including their path and size.

## Live Reload Client (`core/utils/live-reload-client.js`)

Provides the client-side script for live reloading. It is an Immediately Invoked Function Expression (IIFE) that establishes a Server-Sent Events (SSE) connection to the development server. When a "reload" event is received, it reloads the extension. On connection error, it attempts to reconnect after a short delay. This script is injected into the extension's background service worker during development.

## Logger (`core/utils/logger.js`)

A custom logger for formatted console output. It provides methods for different log levels and styles.

-   `step(step, message)`: Logs a step in a process (e.g., `[build] Cleaning dist...`).
-   `success(message)`: Logs a success message in green.
-   `warn(message)`: Logs a warning message in yellow.
-   `error(message)`: Logs an error message in red.
-   `file(path, size)`: Logs a file path and its size.
-   `newLine()`: Prints an empty line for spacing.
-   `setQuiet(value)`: Sets the quiet mode. If `true`, all logging methods are disabled.

## ZIP (`core/utils/zip.js`)

Handles the creation of ZIP archives from a directory.

-   `createZip(sourceDirectory, outputPath)`: Creates a ZIP file at `outputPath` containing the contents of `sourceDirectory`. This is a custom implementation for creating ZIP archives.
