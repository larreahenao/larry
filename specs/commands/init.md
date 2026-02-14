# SPEC: Init Command Module

## 1. Module Description

This document describes the specifications for the `init` command module in the Larrix project. The `init` command is responsible for scaffolding a new Larrix project, setting up the necessary directory structure and initial configuration/source files for a Chrome extension.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions and Classes

The `init` command module primarily consists of an asynchronous function `init(args)` that orchestrates the project scaffolding process.

### `init(args)` Function

*   **Argument Parsing:**
    *   Retrieves the potential project name from the first element of the `args` array.
*   **Interactive Project Name Prompt:**
    *   If a project name is not provided via arguments, it uses `logger.prompt` to interactively ask the user for the project name.
    *   The default value suggested in the prompt is "larrix-extension".
*   **Project Root Determination:**
    *   Constructs the full path to the new project's root directory by joining the current working directory (`process.cwd()`) with the determined `projectName`.
*   **Directory Creation:**
    *   Defines a set of standard directories required for a Chrome extension (e.g., `src/background`, `src/content`, `src/popup`, `src/icons`).
    *   Asynchronously creates these directories, ensuring parent directories are also created if they don't exist (`recursive: true`).
*   **File Generation from Templates:**
    *   Defines a list of core project files (e.g., `.gitignore`, `package.json`, `larrix.config.js`, and various `core` files).
    *   Uses template functions/strings from `core/templates/init.js` to generate content for these files.
    *   Asynchronously writes the generated content to the respective files within the new project structure.
*   **Logging and Feedback:**
    *   Utilizes `logger.step` to indicate major phases (e.g., "Initializing Larrix framework", "Creating project <projectName>").
    *   Uses `logger.file` to log the creation of each file with its size.
    *   Employs `logger.newLine` for improved readability of console output.
    *   Provides a `logger.success` message upon successful project creation.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC:

*   **Advanced Project Name Validation:** Beyond checking for presence, the `init` command does not perform complex validation on the provided or prompted project name (e.g., valid characters, reserved keywords, uniqueness against existing directories).
*   **Existing Directory Handling:** The command does not include logic for handling scenarios where the target project directory already exists (e.g., prompting to overwrite, merging, or aborting with a specific message). The underlying `mkdir` and `writeFile` operations will dictate behavior (e.g., `mkdir` might succeed silently if the directory exists, `writeFile` will overwrite).
*   **Dependency Installation:** The `init` command only scaffolds the project structure and files; it does not automatically run `npm install` or similar commands to set up project dependencies.
*   **Version Control Initialization:** It does not initialize a Git repository or perform any other version control setup, beyond providing a `.gitignore` file.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/commands/init.md` (this file, for its updates).
*   `core/commands/init.js` (the source code file for the init command).
*   `core/templates/init.js` (provides template content for generated files).
*   `core/utils/logger.js` (used for all console output and user prompting).

## 6. Edge Cases

The following edge cases must be considered:

*   **No Project Name Argument and User Provides Empty Input:** If the user does not provide a project name argument and then provides an empty string when prompted by `logger.prompt`, the `projectName` will default to "larrix-extension".
*   **Permissions Errors:** If the command does not have the necessary write permissions to the current working directory (`process.cwd()`) or the specified target project directory, file system operations (`mkdir`, `writeFile`) will fail, resulting in an error.
*   **Disk Full:** If the disk where the project is being created runs out of space, file system operations will fail.
*   **Template Content Issues:** If the template functions or strings in `core/templates/init.js` are invalid or malformed, the generated files will be incorrect or cause errors during project creation.
*   **`logger.prompt` Cancellation/Error:** If `logger.prompt` rejects its promise (e.g., due to user interruption or if `isQuiet` mode is enabled without a `defaultValue`, though the current `logger.prompt` requires a `defaultValue`), the `init` command would not receive a project name and might fail or use a default if available. (Note: The updated `logger.prompt` explicitly requires `defaultValue`, mitigating the "no `defaultValue` in quiet mode" scenario, but user cancellation might still lead to an empty string if not handled by `logger.prompt`).