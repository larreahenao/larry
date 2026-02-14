# SPEC: Main CLI Module

## 1. Module Description

This document describes the specifications for the main module of the Larrix Command Line Interface (CLI). Its primary function is to act as the application's entry point, responsible for interpreting command-line arguments and routing execution to the appropriate command module (`init`, `build`, `dev`, `help`).

## 2. Reference to Code Generation Rules

**Important:** All modifications and code generation for this module must strictly adhere to the guidelines set forth in `specs/code_generation_rules.md`. This file contains all the code quality rules and principles to be followed, including SOLID, architectural design, JSDoc documentation, Clean Code practices, and the requirement that all code and SPECS be written in English.

## 3. Scope of Included Functions

The scope of this SPEC covers the main `run(args)` function located in `core/cli.js`. Specifically, it includes:

*   The logic for reading and distinguishing the main command (`args[0]`).
*   The extraction of parameters for the command (`args.slice(1)`).
*   The `switch` structure that routes execution to the `init`, `build`, `dev`, or `help` functions based on the identified command.
*   **New:** Explicit inclusion of the `help` command as a routable case.
*   **New:** The `default` case will now explicitly call the `help` command for any unknown or unspecified command.
*   The imports of the `init`, `build`, `dev`, and `help` command modules.

## 4. Out of Scope

The following aspects are explicitly out of the scope of this SPEC:

*   The detailed implementation of individual commands (`init`, `build`, `dev`, `help`). Each of these commands must have its own dedicated SPEC.
*   Advanced argument validation or complex option parsing beyond the basic split of `args[0]` and `args.slice(1)`.
*   The addition of new commands to the CLI, other than the `help` command integrated as part of this SPEC.
*   Modification of how existing commands are handled, beyond what is necessary for the proper integration of the `help` command and compliance with code generation rules.

## 5. Involved Files

The files explicitly involved in any changes or code generation related to this SPEC are:

*   `specs/cli.md` (this file, for updates).
*   `core/cli.js` (the main CLI source code file).
*   `specs/code_generation_rules.md` (as a mandatory reference).

## 6. Edge Cases

The following edge cases should be considered:

*   **Unknown Command:** Any command not explicitly defined in the `switch` statement will now gracefully fall back to executing the `help` command.
*   **Missing Arguments:** If no arguments are provided (`args` is empty), this scenario will also result in the execution of the `help` command, providing a default usage message.