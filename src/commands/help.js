import { logger } from "../utils/logger.js";

/**
 * Displays help information for the Larrix CLI.
 * If a specific command is provided, it displays help for that command.
 * Otherwise, it displays general CLI usage.
 * @param {string[]} params - The command-line parameters for the help command.
 */
export async function help(params) {
    const knownCommands = {
        init: {
            description: "Initializes a new Larrix project.",
            usage: "larrix init [options]",
            options: [
                "--force: Overwrite existing files if they conflict."
            ],
            examples: [
                "larrix init                 # Initializes a new project interactively.",
                "larrix init --force         # Forces initialization, overwriting existing files."
            ]
        },
        build: {
            description: "Builds the browser extension for production.",
            usage: "larrix build [options]",
            options: [
                "--watch: Rebuilds on file changes (development only)."
            ],
            examples: [
                "larrix build                # Builds the project for production.",
                "larrix build --watch        # Builds and watches for changes."
            ]
        },
        dev: {
            description: "Starts the development server.",
            usage: "larrix dev [options]",
            options: [
                "--port <number>: Specify port for the development server (default: 8080)."
            ],
            examples: [
                "larrix dev                  # Starts the development server on default port.",
                "larrix dev --port 3000      # Starts the development server on port 3000."
            ]
        },
        help: {
            description: "Displays help information for the Larrix CLI or a specific command.",
            usage: "larrix help [command]",
            options: [],
            examples: [
                "larrix help                 # Displays general help.",
                "larrix help init            # Displays help for the 'init' command."
            ]
        }
    };

    if (params.length > 0) {
        const commandName = params[0];
        const commandHelp = knownCommands[commandName];

        if (commandHelp) {
            displaySpecificHelp(commandName, commandHelp);
        } else {
            logger.error(`Error: Unknown command '${commandName}'.`);
            displayGeneralHelp(knownCommands);
        }
    } else {
        displayGeneralHelp(knownCommands);
    }
}

/**
 * Displays the general usage information for the Larrix CLI.
 * @param {object} knownCommands - An object containing details of all known commands.
 * @private
 */
function displayGeneralHelp(knownCommands) {
    logger.newLine();
    logger.info("Larrix CLI Usage:");
    logger.newLine();
    logger.info("  Usage: larrix <command> [options]");
    logger.newLine();
    logger.info("Available Commands:");
    for (const cmd in knownCommands) {
        logger.info(`  ${cmd.padEnd(10)} ${knownCommands[cmd].description}`);
    }
    logger.newLine();
    logger.info("For detailed information on a specific command, use 'larrix help <command>'.");
    logger.newLine();
}

/**
 * Displays detailed help information for a specific command.
 * @param {string} commandName - The name of the command.
 * @param {object} commandHelp - The help object for the specific command.
 * @private
 */
function displaySpecificHelp(commandName, commandHelp) {
    logger.newLine();
    logger.info(`Command: ${commandName}`);
    logger.newLine();
    logger.info(`Description: ${commandHelp.description}`);
    logger.info(`Usage: ${commandHelp.usage}`);

    if (commandHelp.options && commandHelp.options.length > 0) {
        logger.newLine();
        logger.info("Options:");
        commandHelp.options.forEach(option => {
            logger.info(`  ${option}`);
        });
    }

    if (commandHelp.examples && commandHelp.examples.length > 0) {
        logger.newLine();
        logger.info("Examples:");
        commandHelp.examples.forEach(example => {
            logger.info(`  ${example}`);
        });
    }
    logger.newLine();
}