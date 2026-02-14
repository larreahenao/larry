# SPEC: Build Command Module

## 1. Module Description

This document describes the specifications for the `build` command module in the Larrix project. The `build` command is responsible for compiling and packaging the Larrix browser extension for production. It leverages the `extension-service` module for project validation and the core build process, including generating a distributable ZIP archive of the extension.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions and Classes

The `build` command module primarily consists of an asynchronous function `build()` that orchestrates the production build process.

### `build()` Function

*   **Project Validation:** As the very first step before running any other code, validates that the current directory is a valid Larrix project by checking for the presence of `larrix.config.js`. If not found, it will issue a warning ("This is not a valid Larrix project. 'larrix.config.js' not found in the current directory.") and exit the process, stopping all further execution.
*   **Core Build Execution:**
    *   Asynchronously calls the `buildExtension` utility function (imported from `../utils/extension-service.js`).
    *   Passes an options object to `buildExtension` with the following fixed parameters:
        *   `outputDirectory: "dist"`: Specifies that the compiled extension should be output to a directory named `dist`.
        *   `createZip: true`: Instructs `buildExtension` to create a ZIP archive of the built extension for distribution.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC for the `build` command itself:

*   **Detailed Build Configuration:** The `build` command does not expose direct configuration options. The granular build configuration (e.g., entry points, transformations) is managed internally by the `extension-service` module and potentially `larrix.config.js`.
*   **Linting, Type-Checking, or Testing:** The `build` command's sole responsibility is compilation and packaging; it does not perform code quality checks or execute tests. These are assumed to be handled by other commands or development workflows.
*   **Deployment:** The command generates a distributable package but does not handle the deployment of the extension to a browser store or other distribution platforms.
*   **Build Output Validation:** Beyond the success/failure indication from `buildExtension`, the `build` command does not perform extensive validation of the generated build artifacts (e.g., checking manifest validity, content integrity of the ZIP).

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/commands/build.md` (this file, for its updates).
*   `core/commands/build.js` (the source code file for the build command).
*   `core/utils/extension-service.js` (provides project validation, configuration loading, manifest generation, and core build logic).

## 6. Edge Cases

The following edge cases must be considered:

*   **`buildExtension` Failures:** Any internal errors or failures within the `buildExtension` utility (e.g., compilation errors, module resolution issues, file system access problems during the build process) will cause the `build` command to fail.
*   **File System Permissions:** If the command lacks the necessary write permissions to create the `dist` directory or write files within it, the build process will fail.
*   **Disk Space:** If there is insufficient disk space on the system, the build process (especially during the creation of large output files or the ZIP archive) may fail.
*   **Missing Dependencies:** While `buildExtension` handles the actual compilation, if the project has missing or corrupted development dependencies required by the build tools, `buildExtension` may encounter errors.
*   **Invalid `larrix.config.js`:** If the project's `larrix.config.js` file (which `buildExtension` might depend on) is malformed or invalid, it could lead to build failures within `buildExtension`.
