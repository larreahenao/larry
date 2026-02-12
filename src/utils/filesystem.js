import { rm, mkdir, readdir, copyFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

export async function cleanDirectory(directory) {
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
}

export async function copyDirectory(source, destination) {
    await mkdir(destination, { recursive: true });

    const entries = await readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = join(source, entry.name);
        const destinationPath = join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(sourcePath, destinationPath);
        } else {
            await copyFile(sourcePath, destinationPath);
        }
    }
}

export async function getFilesRecursive(directory, base = directory) {
    const files = [];
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            const nested = await getFilesRecursive(fullPath, base);
            files.push(...nested);
        } else {
            const fileStats = await stat(fullPath);
            files.push({
                path: relative(base, fullPath),
                size: fileStats.size,
            });
        }
    }

    return files;
}
