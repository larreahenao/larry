![Larrix](../assets/logo.png)

# Getting Started with Larrix

Welcome to Larrix! This guide will walk you through the process of installing the CLI and creating your first browser extension.

## Installation

Currently, to use the Larrix CLI, you need to have it available in your local environment. You can run it directly using `node`:

```bash
node /path/to/larrix/bin/larrix <command>
```

For a more convenient global installation, you would typically link the package using `npm`:

```bash
npm link
```

After linking, you can use the `larrix` command globally.

## Creating a New Project

To start a new project, use the `init` command:

```bash
larrix init my-awesome-extension
```

This will create a new directory called `my-awesome-extension` with the following structure:

```
my-awesome-extension/
├── src/
│   ├── background/
│   │   └── index.js
│   ├── content/
│   │   └── index.js
│   ├── popup/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── main.js
│   └── icons/
├── .gitignore
├── larrix.config.js
└── package.json
```

## Project Structure

-   `src/background`: For background scripts that run independently of any web page.
-   `src/content`: For content scripts that run in the context of a web page.
-   `src/popup`: The HTML, CSS, and JavaScript for the extension's popup.
-   `src/icons`: To store your extension's icons.
-   `larrix.config.js`: The main configuration file for your extension.
-   `package.json`: Project metadata and scripts.

## Building for Production

To build your extension, run the `build` command:

```bash
larrix build
```

This will create a `dist` directory with the production-ready files and a ZIP archive ready to be uploaded to the extension store.

## Development

To start the development server, run the `dev` command:

```bash
larrix dev
```

This command is currently a placeholder, but it will be enhanced in the future to provide a better development experience.
