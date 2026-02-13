# Dev Command Specification

The `dev` command is intended to start a development server for the Larrix project.

## Usage

```bash
larrix dev
```

## Flow

Currently, the `dev` command is a placeholder and only logs a message to the console.

## File: `src/commands/dev.js`

```javascript
import { logger } from "../utils/logger.js";

export async function dev(params) {
    logger.step("dev", "Developing Larrix");
}
```
