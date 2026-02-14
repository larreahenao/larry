import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { deflateRawSync } from "node:zlib";
import { writeFile } from "node:fs/promises";

/**
 * Creates a ZIP archive from the files in a source directory.
 * @param {string} sourceDirectory - The path to the directory to be zipped.
 * @param {string} outputPath - The path where the output ZIP file will be saved.
 * @returns {Promise<number>} The total size of the generated ZIP file in bytes.
 */
export async function createZip(sourceDirectory, outputPath) {
    const files = await collectFiles(sourceDirectory);

    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    for (const file of files) {
        const content = await readFile(join(sourceDirectory, file));
        const compressed = deflateRawSync(content);

        const crc = crc32(content);
        const nameBuffer = Buffer.from(file.replace(/\\/g, "/"));

        const localHeader = buildLocalHeader(nameBuffer, compressed, content, crc);
        localHeaders.push(localHeader);

        const centralHeader = buildCentralHeader(nameBuffer, compressed, content, crc, offset);
        centralHeaders.push(centralHeader);

        offset += localHeader.length;
    }

    const centralDirBuffer = Buffer.concat(centralHeaders);
    const centralDirOffset = offset;

    const endRecord = buildEndRecord(centralHeaders.length, centralDirBuffer.length, centralDirOffset);

    const zipBuffer = Buffer.concat([...localHeaders, centralDirBuffer, endRecord]);
    await writeFile(outputPath, zipBuffer);

    return zipBuffer.length;
}

/**
 * Recursively collects all file paths within a given directory.
 * @param {string} directory - The directory to scan.
 * @param {string} [base=directory] - The base path to make file paths relative to.
 * @returns {Promise<string[]>} A list of relative file paths.
 */
async function collectFiles(directory, base = directory) {
    const results = [];
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            const nested = await collectFiles(fullPath, base);
            results.push(...nested);
        } else {
            results.push(relative(base, fullPath));
        }
    }

    return results;
}

/**
 * Builds the local file header for a file in the ZIP archive.
 * @param {Buffer} nameBuffer - The file name as a Buffer.
 * @param {Buffer} compressed - The compressed file content.
 * @param {Buffer} original - The original file content.
 * @param {number} crc - The CRC-32 checksum of the original content.
 * @returns {Buffer} The complete local file header and compressed content.
 */
function buildLocalHeader(nameBuffer, compressed, original, crc) {
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);       // local file header signature
    header.writeUInt16LE(20, 4);                // version needed to extract
    header.writeUInt16LE(0, 6);                 // general purpose bit flag
    header.writeUInt16LE(8, 8);                 // compression method (deflate)
    header.writeUInt16LE(0, 10);                // last mod file time
    header.writeUInt16LE(0, 12);                // last mod file date
    header.writeUInt32LE(crc, 14);              // crc-32
    header.writeUInt32LE(compressed.length, 18); // compressed size
    header.writeUInt32LE(original.length, 22);  // uncompressed size
    header.writeUInt16LE(nameBuffer.length, 26); // file name length
    header.writeUInt16LE(0, 28);                // extra field length

    return Buffer.concat([header, nameBuffer, compressed]);
}

/**
 * Builds the central directory header for a file in the ZIP archive.
 * @param {Buffer} nameBuffer - The file name as a Buffer.
 * @param {Buffer} compressed - The compressed file content.
 * @param {Buffer} original - The original file content.
 * @param {number} crc - The CRC-32 checksum of the original content.
 * @param {number} localHeaderOffset - The offset of the local file header.
 * @returns {Buffer} The complete central directory header.
 */
function buildCentralHeader(nameBuffer, compressed, original, crc, localHeaderOffset) {
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);       // central directory header signature
    header.writeUInt16LE(20, 4);                // version made by
    header.writeUInt16LE(20, 6);                // version needed to extract
    header.writeUInt16LE(0, 8);                 // general purpose bit flag
    header.writeUInt16LE(8, 10);                // compression method (deflate)
    header.writeUInt16LE(0, 12);                // last mod file time
    header.writeUInt16LE(0, 14);                // last mod file date
    header.writeUInt32LE(crc, 16);              // crc-32
    header.writeUInt32LE(compressed.length, 20); // compressed size
    header.writeUInt32LE(original.length, 24);  // uncompressed size
    header.writeUInt16LE(nameBuffer.length, 28); // file name length
    header.writeUInt16LE(0, 30);                // extra field length
    header.writeUInt16LE(0, 32);                // file comment length
    header.writeUInt16LE(0, 34);                // disk number start
    header.writeUInt16LE(0, 36);                // internal file attributes
    header.writeUInt32LE(0, 38);                // external file attributes
    header.writeUInt32LE(localHeaderOffset, 42); // relative offset of local header

    return Buffer.concat([header, nameBuffer]);
}

/**
 * Builds the "End of Central Directory" record for the ZIP archive.
 * @param {number} entryCount - The total number of files in the archive.
 * @param {number} centralDirSize - The total size of the central directory.
 * @param {number} centralDirOffset - The offset where the central directory starts.
 * @returns {Buffer} The "End of Central Directory" record.
 */
function buildEndRecord(entryCount, centralDirSize, centralDirOffset) {
    const record = Buffer.alloc(22);
    record.writeUInt32LE(0x06054b50, 0);        // end of central directory signature
    record.writeUInt16LE(0, 4);                  // number of this disk
    record.writeUInt16LE(0, 6);                  // disk where central directory starts
    record.writeUInt16LE(entryCount, 8);         // entries on this disk
    record.writeUInt16LE(entryCount, 10);        // total entries
    record.writeUInt32LE(centralDirSize, 12);    // size of central directory
    record.writeUInt32LE(centralDirOffset, 16);  // offset of central directory
    record.writeUInt16LE(0, 20);                 // comment length

    return record;
}

/**
 * Calculates the CRC-32 checksum for a buffer.
 * @param {Buffer} buffer - The input buffer.
 * @returns {number} The calculated CRC-32 checksum.
 */
function crc32(buffer) {
    let crc = 0xFFFFFFFF;

    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
}
