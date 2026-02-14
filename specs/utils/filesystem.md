# SPEC: Filesystem Utility Module

## 1. Module Description

This document describes the specifications for the `filesystem` utility module (`core/utils/filesystem.js`) in the Larrix project. This module provides a collection of asynchronous and synchronous utility functions for common, low-level file system operations, promoting reusability and abstracting away direct Node.js `fs` module interactions. It focuses purely on file and directory manipulation and inspection, without knowledge of specific project structures or domain-specific content.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions

The `filesystem` utility module currently includes the following functions:

### `cleanDirectory(directory)`

*   **Purpose:** Deletes a directory and all its contents, then recreates an empty directory at the same path.
*   **Parameters:**
    *   `directory` (string): The path to the directory to be cleaned.
*   **Behavior:**
    *   Recursively removes the directory and its contents (`rm -rf` equivalent).
    *   Creates a new, empty directory.

### `copyDirectory(source, destination)`

*   **Purpose:** Recursively copies the contents of a source directory to a destination directory.
*   **Parameters:**
    *   `source` (string): The path to the source directory.
    *   `destination` (string): The path to the destination directory.
*   **Behavior:**
    *   Creates the destination directory if it does not exist.
    *   Copies all files and subdirectories from the source to the destination.

### `getFilesRecursive(directory, base)`

*   **Purpose:** Recursively retrieves a list of all files within a specified directory and its subdirectories.
*   **Parameters:**
    *   `directory` (string): The path to the directory to start searching from.
    *   `base` (string, optional): The base path to calculate relative file paths. Defaults to `directory`.
*   **Returns:** `Promise<Array<{ path: string, size: number }>>` - A promise that resolves to an array of objects, where each object contains the `path` (relative to `base`) and `size` of a file.

### `fileExists(path)` (To be migrated from `extension-service.js`)

*   **Purpose:** Checks if a file or directory exists at the given path.
*   **Parameters:**
    *   `path` (string): The path to check.
*   **Returns:** `Promise<boolean>` - A promise that resolves to `true` if the file/directory exists, `false` otherwise. This function will be migrated from `extension-service.js` to consolidate file system related utilities.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC for the `filesystem` utility module itself:

*   **Domain-Specific Logic:** This module does not contain any logic specific to Larrix projects, browser extensions, or their configurations (e.g., loading `larrix.config.js`, generating `manifest.json`, validating project structure).
*   **Advanced Path Manipulation:** Only basic path joining and relative path calculations are covered; complex path parsing or manipulation is outside its scope.
*   **File Content Transformations:** Reading and writing file content is within scope, but transformations or processing of content (e.g., parsing JSON, minifying code) are not.
*   **Permissions Management (explicit):** While `fileExists` can implicitly deal with access errors, explicit permission setting or granular checking (beyond simple existence) is not a primary function.
*   **Race Conditions:** While individual operations are atomic, concurrent file system operations outside this module could lead to unexpected states. This module does not provide locking mechanisms.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/utils/filesystem.md` (this file, for its updates).
*   `core/utils/filesystem.js` (the source code file for the filesystem utilities).
*   `core/utils/extension-service.js` (from where `fileExists` will be migrated).

## 6. Edge Cases

The following edge cases must be considered:

*   **Non-existent Paths:** Functions should gracefully handle non-existent source paths (e.g., `copyDirectory` will create a new destination, `cleanDirectory` will create an empty one).
*   **File System Permissions:** Lack of appropriate read/write permissions for specified paths will result in errors being thrown or promises being rejected for asynchronous operations.
*   **Large File/Directory Operations:** While generally efficient, operations on extremely large numbers of files or very deep directory structures may still consume significant resources.
