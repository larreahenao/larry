# Build Command Specification

The `build` command compiles and packages the browser extension for production.

## Usage

```bash
larrix build
```

## Flow

1.  **Load Configuration**: It loads the `larrix.config.js` file from the project root.
2.  **Clean `dist` Directory**: It removes the existing `dist` directory and recreates it to ensure a clean build.
3.  **Copy Source Files**: It copies the contents of the `src` directory to the `dist` directory.
4.  **Generate `manifest.json`**: It dynamically generates the `manifest.json` file based on the `larrix.config.js` and the presence of `background`, `content`, and `popup` scripts.
5.  **Create ZIP Archive**: It creates a ZIP archive of the `dist` directory, named `{name}-{version}.zip` (e.g., `my-extension-1.0.0.zip`).
6.  **Log Progress**: It logs each step of the build process, including file sizes and the final ZIP file name and size.

## File: `src/commands/build.js`

This file orchestrates the entire build process. It utilizes utility functions for file system operations and ZIP creation.
