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

class Logger {
    step(step, message) {
        console.log(`  ${dim(`[${step}]`)} ${message}`);
    }

    success(message) {
        console.log(`  ${green(message)}`);
    }

    warn(message) {
        console.log(`  ${yellow(message)}`);
    }

    error(message) {
        console.log(`  ${red(message)}`);
    }

    file(path, size) {
        const paddedPath = path.padEnd(40);
        console.log(`  ${cyan(paddedPath)} ${dim(size)}`);
    }

    newLine() {
        console.log();
    }
}

export const logger = new Logger();