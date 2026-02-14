import { init } from "../commands/init.js";
import { build } from "../commands/build.js";
import { dev } from "../commands/dev.js";
import { help } from "../commands/help.js";

/**
 * Executes the appropriate command based on the provided arguments.
 * @param {string[]} args - The command-line arguments.
 */
export async function run(args) {
    const command = args[0];
    const params = args.slice(1);

    switch (command) {
        case 'init':
            await init(params);
            break;
        case 'build':
            await build(params);
            break;
        case 'dev':
            await dev(params);
            break;
        case 'help':
            await help(params);
            break;
        default:
            await help(params);
            break;
    }
}