/**
 * Generates the content for the package.json file.
 * @param {string} projectName - The name of the project.
 * @returns {string} The formatted package.json content.
 */
export function packageJson(projectName) {
    return JSON.stringify({
        name: projectName,
        version: "1.0.0",
        description: "A browser extension built with Larrix",
        type: "module",
        scripts: {
            dev: "larrix dev",
            build: "larrix build",
        },
    }, null, 4);
}

/**
 * Generates the content for the larrix.config.js file.
 * @param {string} projectName - The name of the project.
 * @returns {string} The larrix.config.js content.
 */
export function larrixConfig(projectName) {
    return `export default {
    name: "${projectName}",
    version: "1.0.0",
    manifest: {
        manifest_version: 3,
        permissions: [],
    },
};
`;
}

export const gitignore = `node_modules
dist
.DS_Store
`;

export const backgroundIndex = `chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});
`;

export const contentIndex = `console.log("Content script loaded");
`;

export const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Popup</title>
</head>
<body>
    <div id="app">
        <h1>Hello from Larrix</h1>
    </div>
    <script src="main.js"></script>
</body>
</html>
`;

export const popupCss = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    width: 320px;
    min-height: 200px;
    font-family: system-ui, sans-serif;
    padding: 16px;
}

h1 {
    font-size: 18px;
    font-weight: 600;
}
`;

export const popupMain = `const app = document.getElementById("app");
console.log("Popup loaded");
`;
