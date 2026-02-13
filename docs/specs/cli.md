# CLI Specification

The main entry point for the Larrix CLI. It parses the command-line arguments and routes them to the appropriate command module.

## Usage

```bash
larrix <command> [options]
```

## Commands

- `init`: Initializes a new Larrix project.
- `build`: Builds the browser extension for production.
- `dev`: Starts the development server.

## File: `src/cli.js`

The `src/cli.js` file is the heart of the command-line interface. It imports the available commands and uses a `switch` statement to execute the one specified by the user.

```javascript
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
```
