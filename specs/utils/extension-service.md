# SPEC: Extension Service Module

## 1. Module Description

This document describes the specifications for the `extension-service` module (`src/utils/extension-service.js`) in the Larrix project. This module provides higher-level services and orchestrates operations related to the Larrix browser extension, including project validation, configuration loading, manifest generation, and the core build process. It acts as a central hub for logic that understands the structure and requirements of a Larrix extension.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions

The `extension-service` module currently includes the following functions:

### `validateLarrixProject(currentWorkingDirectory)`

*   **Purpose:** Validates if the current directory is a valid Larrix project by checking for the presence of `larrix.config.js`. It performs a synchronous check as it's a critical initial validation.
*   **Parameters:**
    *   `currentWorkingDirectory` (string): The path to the current working directory.
*   **Behavior:**
    *   Checks for the existence of `larrix.config.js` in the `currentWorkingDirectory` using a synchronous file system call (`fs.existsSync`). This function implicitly relies on low-level file system capabilities.
    *   If `larrix.config.js` is not found, it logs a warning message to the console and exits the process with an error code.
    *   This function is intended to be called as the very first step in commands that require a valid Larrix project context.

### `loadConfiguration()`

*   **Purpose:** Loads the project's configuration from `larrix.config.js` in the current working directory.
*   **Parameters:** None.
*   **Returns:** `Promise<object>` - A promise that resolves to the configuration object.
*   **Behavior:**
    *   Reads `larrix.config.js` and imports it dynamically.

### `generateManifest(configuration, sourceDirectory)`

*   **Purpose:** Generates the `manifest.json` content for the browser extension based on the project configuration and the source directory.
*   **Parameters:**
    *   `configuration` (object): The project configuration loaded from `larrix.config.js`.
    *   `sourceDirectory` (string): The path to the extension's source directory.
*   **Returns:** `Promise<object>` - A promise that resolves to the generated `manifest.json` object.
*   **Behavior:**
    *   Constructs the basic `manifest.json` structure (manifest_version, name, version).
    *   Includes additional manifest properties from `configuration.manifest`.
    *   Conditionally adds `background`, `content_scripts`, and `action` properties based on the existence of corresponding files (e.g., `background/index.js`, `content/index.js`, `popup/index.html`) in the `sourceDirectory`. This function will utilize `fileExists` (from `filesystem.js`) for its file existence checks.

### `buildExtension(options)`

*   **Purpose:** Executes the core build process for the Larrix project. This function handles loading configuration, cleaning output directories, copying source files, generating the manifest, and optionally creating a ZIP archive.
*   **Parameters:**
    *   `options` (object): The build options.
    *   `options.outputDirectory` (string): The name of the output directory (e.g., 'dist', 'tmp').
    *   `options.createZip` (boolean): Whether to create a ZIP archive of the build output.
    *   `options.quiet` (boolean, optional): If true, suppresses console output during the build process.
*   **Behavior:**
    *   Orchestrates a series of steps: sets quiet mode for logging, defines working directories, loads configuration using `loadConfiguration()`, cleans the distribution directory, copies source files, generates `manifest.json` using `generateManifest()`, and optionally creates a ZIP archive. It delegates low-level file operations to the `filesystem` utility module. The size of the files will be formatted using `logger.formatSize`.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC for the `extension-service` module itself:

*   **Low-Level File System Operations:** This module delegates generic file reading, writing, copying, or directory manipulation to the `filesystem` utility module.
*   **CLI Command Definition:** It does not define or parse command-line arguments.
*   **Server-Side Logic for Development:** It does not include logic for running development servers or managing live-reloading client connections.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/utils/extension-service.md` (this file, for its updates).
*   `src/utils/extension-service.js` (the source code file for the extension services).
*   `src/utils/filesystem.js` (provides low-level file system operations).
*   `src/utils/logger.js` (used for console output).
*   `src/utils/zip.js` (used for creating ZIP archives).
*   `larrix.config.js` (the configuration file it interacts with).

## 6. Edge Cases

The following edge cases must be considered:

*   **Invalid `larrix.config.js`:** If `loadConfiguration` attempts to load a malformed or invalid `larrix.config.js`, it could lead to import errors. The module relies on external mechanisms for `larrix.config.js` content validation.
*   **Missing Project Context:** `validateLarrixProject` handles the absence of `larrix.config.js`.
*   **Build Failures:** Errors during the `buildExtension` process (e.g., due to file system issues, invalid configuration, or problems with delegated utilities) will result in a failed build, which the calling command should handle.
*   **File Existence for Manifest:** `generateManifest` handles the absence of optional source files by omitting corresponding manifest properties.
