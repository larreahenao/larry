import { init } from "./commands/init.js";
import { build } from "./commands/build.js";
import { dev } from "./commands/dev.js";

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
        default:
            console.log("Unknown command");
            break;
    }
}