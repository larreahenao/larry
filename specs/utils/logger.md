# SPEC: Logger Utility Module

## 1. Module Description

This document describes the specifications for the `logger` utility module in the Larrix project. This module provides a centralized and formatted way to output messages to the console, ensuring consistency across the application. It supports different levels of logging (info, step, success, warn, error) and user interaction (prompts via native Node.js `readline`). It also includes a "quiet mode" to suppress output and disable interactive elements.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions and Classes

The scope of this SPEC covers the `Logger` class and its methods, as well as the exported `logger` instance, all located in `src/utils/logger.js`.

### `Logger` Class

*   **`constructor()`:** Initializes the logger instance.
*   **`isQuiet` property:**
    *   @private
    *   Type: `boolean`
    *   Controls whether messages are logged and interactive elements are enabled.
*   **`setQuiet(value: boolean)`:** Sets the `isQuiet` flag, enabling or disabling console output and interactive features.

### Logging Methods

All logging methods must respect the `isQuiet` flag, meaning they will not output anything if `isQuiet` is `true`.

*   **`info(message: string)`:** Logs a general informational message. This method is similar to `step` but without the bracketed step identifier, providing a cleaner output for general information.
    *   **Output Format:** `  <message>` (no special formatting beyond indentation, or potentially a neutral color like cyan).
*   **`step(step: string, message: string)`:** Logs a step in a process, typically formatted with a dimmer step identifier and a message.
    *   **Output Format:** `  <dimmed [step]> <message>`
*   **`success(message: string)`:** Logs a success message, typically formatted in green.
    *   **Output Format:** `  <green message>`
*   **`warn(message: string)`:** Logs a warning message, typically formatted in yellow.
    *   **Output Format:** `  <yellow message>`
*   **`error(message: string)`:** Logs an error message, typically formatted in red.
    *   **Output Format:** `  <red message>`
*   **`file(path: string, size: string)`:** Logs a file path and its size, typically with the path in cyan and size dimmed.
    *   **Output Format:** `  <cyan paddedPath> <dimmed size>`
*   **`newLine()`:** Prints an empty line to the console for spacing.
*   **`formatSize(bytes: number): string`:**
    *   **Purpose:** Formats a given size in bytes into a human-readable string (e.g., "1024 B", "1.50 kB").
    *   **Parameters:**
        *   `bytes` (number): The size in bytes.
    *   **Returns:** `string` - The formatted size string.

### User Interaction Methods

These methods enable direct interaction with the user through the console. They must respect the `isQuiet` flag; if `isQuiet` is `true`, they should return a default/predefined value or throw an error to prevent blocking.

*   **`prompt(question: string, defaultValue: string): Promise<string>`:** Asks the user a question and waits for their textual input.
    *   **Asynchronous Nature:** This method must be asynchronous, returning a `Promise` that resolves with the user's input.
    *   **Behavior in `isQuiet` mode:** If `isQuiet` is `true`, the method immediately resolves the `Promise` with `defaultValue`.
    *   **Implementation:** Must use Node.js's native `readline` module.
    *   **Output Format:** Presents the `question` clearly and indicates the `defaultValue` to the user as part of the prompt.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC:

*   Advanced logging features such as logging to files, remote logging services, or different log levels beyond the defined methods (e.g., debug, verbose, trace).
*   Configurable output streams (e.g., directing output to `stderr` for errors). All *logging* output is directed to `console.log`.
*   Complex message templating or dynamic string interpolation beyond what is currently implemented or explicitly specified.
*   Advanced prompt features such as password masking, keypress detection, or complex input validation rules directly within `prompt` (validation is expected from the caller).
*   Loading state indicators (spinners or progress bars). These will be handled by other modules or implemented in the future if deemed necessary without external dependencies.
*   Integration with external logging frameworks.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/utils/logger.md` (this file, for its updates).
*   `src/utils/logger.js` (the source code file for the logger utility).
*   Any other module that imports and uses the `logger` instance.

## 6. Edge Cases

The following edge cases must be considered:

*   **Quiet Mode Enabled:** When `isQuiet` is set to `true` via `setQuiet(true)`:
    *   All logging methods (`info`, `step`, `success`, `warn`, `error`, `file`, `newLine`) should produce no console output.
    *   `prompt` should return its `defaultValue` if provided, or reject with an error otherwise.
*   **Empty Messages/Questions:** Calling logging methods with empty strings or undefined values for messages/questions should not cause errors. `prompt` should still display the empty question.
*   **Color/Style Codes:** The ANSI escape codes for colors and styles must be correctly applied and reset for each message to avoid leaking styles to subsequent console outputs.
*   **Prompt Cancellation/Interruption:** The `prompt` method should handle user interruption (e.g., Ctrl+C) gracefully, rejecting the `Promise` with an appropriate error.
