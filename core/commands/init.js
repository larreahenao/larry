import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../utils/logger.js";
import * as templates from "../templates/init.js";

/**
 * Initializes a new Larrix project by creating the necessary directory structure
 * and configuration files. It prompts for a project name if one is not provided.
 * @param {string[]} args - The command-line arguments, with the first argument
 *                           being the optional project name.
 */
export async function init(args) {
    let projectName = args[0];

    logger.newLine();
    logger.step("init", "Initializing Larrix framework");

    if (!projectName) {
        logger.newLine();
        projectName = await logger.prompt("What is the name of your project?", "larrix-extension");
        logger.newLine();
    }

    const root = join(process.cwd(), projectName);

    const directories = [
        "src/background",
        "src/content",
        "src/popup",
        "src/icons",
    ];

    const files = [
        { path: ".gitignore", content: templates.gitignore },
        { path: "package.json", content: templates.packageJson(projectName) },
        { path: "larrix.config.js", content: templates.larrixConfig(projectName) },
        { path: "src/background/index.js", content: templates.backgroundIndex },
        { path: "src/content/index.js", content: templates.contentIndex },
        { path: "src/popup/index.html", content: templates.popupHtml },
        { path: "src/popup/style.css", content: templates.popupCss },
        { path: "src/popup/main.js", content: templates.popupMain },
    ];

    logger.step("init", `Creating project ${projectName}`);
    logger.newLine();

    for (const directory of directories) {
        await mkdir(join(root, directory), { recursive: true });
    }

    for (const file of files) {
        await writeFile(join(root, file.path), file.content);
        logger.file(file.path, `${Buffer.byteLength(file.content)} B`);
    }

    logger.newLine();
    logger.success(`Project ${projectName} created successfully`);
    logger.newLine();
}