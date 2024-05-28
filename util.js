import kleur from "kleur";
import shell from "shelljs";
import fs from 'fs';
import StreamZip from 'node-stream-zip'
import { spinner as promptSpinner } from '@clack/prompts';

/**
 * @param {string} workingDirectory
 */
export function onError(workingDirectory) {
    shell.rm('-rf', workingDirectory);
    shell.exit(1);
}

/**
 * @param {() => shell.ShellString} fn
 * @param {import('./types/index.js').onErrorCallback} onError
 * @param {string} msg
 */
export function errorWrap(fn, onError, msg) {
    const blueprint = fn();

    if (blueprint.stderr) {
        console.log(kleur.red(`${msg}: ${blueprint.stderr}`));
        if (onError) {
            onError();
        }
    }

    return blueprint.stdout
}

/**
 * @param {string} path
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function unzipBackend(path, onError) {
    const s = promptSpinner();
    s.start('Extracting backend files...');

    const zip = new StreamZip.async({ file: path });

    try {
        const count = await zip.extract(null, 'backend');
        await zip.close();
    } catch (e) {
        s.stop();
        onError();
    }

    s.stop();
}
