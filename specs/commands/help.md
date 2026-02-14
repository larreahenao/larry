# SPEC: Help Command Module

## 1. Module Description

This document describes the specifications for the `help` command module within the Larrix CLI. This module is responsible for providing users with comprehensive information about the CLI's usage, available commands, and, crucially, detailed help for specific commands when requested. It is designed to be the primary interface for user guidance and discoverability of CLI functionalities.

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions

The scope of this SPEC covers the `help(params)` function located in `core/commands/help.js`. Specifically, it includes:

*   **Argument Parsing:** Logic to correctly parse `params` to identify if a request for general help or specific command help has been made.
*   **General Help Display:** When no command or an invalid command is specified (as per edge cases), it must display a concise overview of the Larrix CLI, including its general usage syntax and a list of all available top-level commands with their brief descriptions.
*   **Specific Command Help Display:** When a valid specific command name is provided (e.g., `larrix help init`), it must display detailed information relevant to *that specific command*. This includes its purpose, syntax, available options, and examples of use.
*   **Logger Utilization (Mandatory):** All console output from the `help` command **must** exclusively use the `logger` utility from `core/utils/logger.js`.
    *   **Informational Messages (General Help, Command-Specific Help):** Should use `logger.step` for main points and descriptions, possibly `logger.newLine()` for formatting. Headings might use `logger.success` for emphasis, but sparingly.
    *   **Error/Warning Messages (e.g., Unknown Command):** Must use `logger.error` or `logger.warn` as appropriate.
    *   **Formatting:** The output should be well-structured and readable, using `logger.newLine()` and appropriate spacing to enhance clarity.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC:

*   The detailed implementation logic of *other* CLI commands (e.g., `init`, `build`, `dev`). This SPEC solely concerns how the `help` command retrieves and presents information about them, not their operational mechanics.
*   Advanced user interface features for help documentation, such as interactive menus, paginated output within the terminal, or dynamic search functionalities. The output will be primarily text-based.
*   Automatic generation of help content directly from source code annotations (e.g., JSDoc comments of other commands). The `help` command's content will be explicitly defined within its implementation, possibly through static data or simple conditional logic.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/commands/help.md` (this file, for its creation and subsequent updates).
*   `core/commands/help.js` (the source code file implementing the help command).
*   `core/cli.js` (the main CLI entry point, as it directly calls the `help` command).
*   `core/utils/logger.js` (as a mandatory utility for all console output operations).

## 6. Edge Cases

The following edge cases must be handled by the `help` command:

*   **General Help Request (No Parameters or Invalid Command as Fallback):** When the `help` command is invoked without any parameters (e.g., `larrix help` or `larrix` with no command), it must display the general CLI usage, including a list and brief description of all available top-level commands.
*   **Request for Help on Unknown Command (`larrix help unknown_command`):** If the user provides a command name that does not correspond to any known CLI command, the `help` command must:
    1.  Use `logger.error` to output a clear error message indicating that the specified command was not found.
    2.  Subsequently, display the **general CLI usage** as a fallback, guiding the user towards valid options.
*   **Request for Help on Valid Command (`larrix help init`):** If a valid command name is provided, the `help` command must display detailed, command-specific help information, including its syntax, options, and usage examples. If the command's specific help content is not yet implemented, it should display a message indicating this and then fall back to general usage.
*   **Multiple Parameters for Specific Help (`larrix help command1 command2`):** The `help` command should process only the *first* parameter as the intended command for specific help. Subsequent parameters should be ignored, or a warning (using `logger.warn`) could be issued if deemed necessary, without affecting the primary specific help display.
