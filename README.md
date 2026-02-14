# Larrix

The vanilla JS framework for browser extensions.

Larrix is a zero-dependency CLI that scaffolds, builds, and packages Manifest V3 browser extensions using only vanilla JavaScript and Node.js built-ins.

## Core Principles

-   **Zero Dependencies**: Larrix is built with only vanilla JavaScript and Node.js built-ins. We do not use external libraries. This keeps the framework lightweight and secure.

## Install

```bash
npm install -g larrix
```

## Quick Start

```bash
larrix init my-extension
cd my-extension
larrix build
```

## Project Structure

Running `larrix init` generates the following structure:

```
my-extension/
├── .gitignore
├── larrix.config.js
├── package.json
└── core/
    ├── background/
    │   └── index.js          # Service Worker
    ├── content/
    │   └── index.js          # Content script
    ├── popup/
    │   ├── index.html
    │   ├── style.css
    │   └── main.js
    └── icons/
```

## Commands

### `larrix init <name>`

Scaffolds a new browser extension project with all the necessary files and folder structure.

### `larrix build`

Production build:

1. Cleans `dist/`
2. Copies `src/` to `dist/`
3. Auto-generates `manifest.json` from `larrix.config.js`
4. Creates a `<name>-<version>.zip` ready for Chrome Web Store upload

### `larrix dev`

Development mode with live reloading. *(Coming soon)*

## Configuration

All project settings live in `larrix.config.js`:

```js
export default {
    name: "my-extension",
    version: "1.0.0",
    manifest: {
        manifest_version: 3,
        permissions: [],
    },
};
```

The build command auto-detects entry points based on your `src/` structure:

| Directory | Manifest Entry |
|---|---|
| `src/background/index.js` | `background.service_worker` |
| `src/content/index.js` | `content_scripts` |
| `src/popup/index.html` | `action.default_popup` |

## License

MIT
