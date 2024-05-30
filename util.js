import kleur from 'kleur';
import shell from 'shelljs';
import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * @param {string} workingDirectory
 */
export function onError(workingDirectory) {
    shell.rm('-rf', workingDirectory);
    shell.exit(1);
}

/**
 * @param {string} file
 * @param {string} content
 * @param {() => void} onError
 * */
export function writeFileOrError(file, content, onError) {
    try {
        fs.writeFileSync(file, content);
    } catch (e) {
        if (e instanceof Error) {
            console.log(kleur.red(`Cannot write .env file: ${e.message}`));
            onError();
            return;
        }

        console.log(kleur.red(`Something wrong happened. Please, try again.`));
        onError();
    }
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

    return blueprint.stdout;
}

export async function generatePassword(
    length = 20,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$',
) {
    const rnd = Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => characters[x % characters.length])
        .join('');

    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(rnd, salt);
}
