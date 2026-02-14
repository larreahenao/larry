import { createInterface } from 'node:readline';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const FOREGROUND_CYAN = '\x1b[36m';
const FOREGROUND_GREEN = '\x1b[32m';
const FOREGROUND_RED = '\x1b[31m';
const FOREGROUND_YELLOW = '\x1b[33m';

const bold = (text) => `${BOLD}${text}${RESET}`;
const dim = (text) => `${DIM}${text}${RESET}`;
const cyan = (text) => `${FOREGROUND_CYAN}${text}${RESET}`;
const green = (text) => `${FOREGROUND_GREEN}${text}${RESET}`;
const red = (text) => `${FOREGROUND_RED}${text}${RESET}`;
const yellow = (text) => `${FOREGROUND_YELLOW}${text}${RESET}`;

/**
 * A custom logger for formatted console output.
 */
class Logger {
    /**
     * Indicates whether the logger is in quiet mode.
     * When true, no messages will be logged to the console.
     * @private
     * @type {boolean}
     */
    isQuiet = false;

    /**
     * Creates an instance of Logger.
     */
    constructor() {
        // No initialization needed as isQuiet is set directly
    }

    /**
     * Sets the quiet mode for the logger.
     * When quiet mode is enabled, no messages will be logged to the console.
     * @param {boolean} value - True to enable quiet mode, false to disable.
     */
    setQuiet(value) {
        this.isQuiet = value;
    }

    /**
     * Logs a general informational message.
     * @param {string} message - The informational message to log.
     */
    info(message) {
        if (this.isQuiet) return;
        console.log(`  ${message}`);
    }

    /**
     * Logs a step in a process.
     * @param {string} step - The name of the current step (e.g., "build", "dev").
     * @param {string} message - The message to log.
     */
    step(step, message) {
        if (this.isQuiet) return;
        console.log(`  ${dim(`[${step}]`)} ${message}`);
    }

    /**
     * Logs a success message.
     * @param {string} message - The success message to log.
     */
    success(message) {
        if (this.isQuiet) return;
        console.log(`  ${green(message)}`);
    }

    /**
     * Logs a warning message.
     * @param {string} message - The warning message to log.
     */
    warn(message) {
        if (this.isQuiet) return;
        console.log(`  ${yellow(message)}`);
    }

    /**
     * Logs an error message.
     * @param {string} message - The error message to log.
     */
    error(message) {
        if (this.isQuiet) return;
        console.log(`  ${red(message)}`);
    }

    /**
     * Logs a file path and its size.
     * @param {string} path - The path to the file.
     * @param {string} size - The formatted size of the file.
     */
    file(path, size) {
        if (this.isQuiet) return;
        const paddedPath = path.padEnd(40);
        console.log(`  ${cyan(paddedPath)} ${dim(size)}`);
    }

    /**
     * Prints an empty line to the console for spacing.
     */
    newLine() {
        if (this.isQuiet) return;
        console.log();
    }

    /**
     * Formats a given size in bytes into a human-readable string (e.g., "1024 B", "1.50 kB").
     * @param {number} bytes - The size in bytes.
     * @returns {string} The formatted size string.
     */
    formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(2)} kB`;
    }

    /**
     * Asks the user a question and waits for their textual input.
     * @param {string} question - The question to ask the user.
     * @param {string} [defaultValue] - The default value to use if no input is provided or in quiet mode.
     * @returns {Promise<string>} A Promise that resolves with the user's input.
     */
    prompt(question, defaultValue) {
        if (!defaultValue) {
            throw new Error("Default value is required for prompt");
        }

        if (this.isQuiet) {
            return Promise.resolve(defaultValue);
        }

        return new Promise((resolve) => {
            const promptInterface = createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            promptInterface.question(`  ${question} ${dim(`(${defaultValue})`)}: `, (answer) => {
                promptInterface.close();
                resolve(answer || defaultValue);
            });
        });
    }
}

export const logger = new Logger();