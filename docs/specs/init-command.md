# Init Command Specification

The `init` command scaffolds a new Larrix project in the specified directory.

## Usage

```bash
larrix init <project-name>
```

## Flow

1.  **Parse Project Name**: The command takes the project name as the first argument. If it's not provided, it logs an error.
2.  **Create Directories**: It creates the necessary directory structure for a browser extension, including `src/background`, `src/content`, `src/popup`, and `src/icons`.
3.  **Generate Files**: It creates the following configuration and source files from templates:
    -   `.gitignore`
    -   `package.json`
    -   `larrix.config.js`
    -   `src/background/index.js`
    -   `src/content/index.js`
    -   `src/popup/index.html`
    -   `src/popup/style.css`
    -   `src/popup/main.js`
4.  **Log Progress**: Throughout the process, it logs the files and directories being created.
5.  **Success Message**: Once completed, it logs a success message.

## File: `src/commands/init.js`

This file contains the core logic for the `init` command. It uses templates from `src/templates/init.js` to generate the project files.

## File: `src/templates/init.js`

This file exports template strings and functions for generating the initial project files. This includes `package.json`, `larrix.config.js`, and the basic HTML, CSS, and JavaScript for the popup.
