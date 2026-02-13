# Utilities Specification

The `src/utils` directory contains modules with helper functions used across the CLI.

## Filesystem (`src/utils/filesystem.js`)

Provides functions for interacting with the file system.

-   `cleanDirectory(directory)`: Recursively removes and recreates a directory.
-   `copyDirectory(source, destination)`: Recursively copies a directory.
-   `getFilesRecursive(directory, base)`: Returns a flat list of all files in a directory, including their path and size.

## Logger (`src/utils/logger.js`)

A custom logger for formatted console output. It provides methods for different log levels and styles.

-   `step(step, message)`: Logs a step in a process (e.g., `[build] Cleaning dist...`).
-   `success(message)`: Logs a success message in green.
-   `warn(message)`: Logs a warning message in yellow.
-   `error(message)`: Logs an error message in red.
-   `file(path, size)`: Logs a file path and its size.
-   `newLine()`: Prints an empty line for spacing.

## ZIP (`src/utils/zip.js`)

Handles the creation of ZIP archives from a directory.

-   `createZip(sourceDirectory, outputPath)`: Creates a ZIP file at `outputPath` containing the contents of `sourceDirectory`. This is a custom implementation for creating ZIP archives.
