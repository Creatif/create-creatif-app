import { spinner as promptSpinner } from '@clack/prompts';
import StreamZip from 'node-stream-zip';
import kleur from 'kleur';
import fs from 'fs';
import { errorWrap, generatePassword, writeFileOrError } from './util.js';
import shell from 'shelljs';
import { readdirSync } from 'fs';
import { backendEnv } from './templates/templates.js';

/**
 * @param {string} path
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryUnzipBackend(path, onError) {
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

    s.stop('Backend files extracted');
}

/**
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryWriteBackendZip(onError) {
    const s = promptSpinner();
    s.start('Downloading backend files...');
    try {
        const response = await fetch('https://api.github.com/repos/Creatif/creatif-backend/zipball', {
            method: 'GET',
        });

        if (!response.ok) {
            console.log(
                kleur.red(
                    `A ${response.status} error occurred while trying to get backend repository files. This error is unrecoverable. Please, try again later`,
                ),
            );
            onError();
            s.stop();
            return;
        }

        if (response.ok) {
            const b = await response.blob();

            const buffer = Buffer.from(await b.arrayBuffer());

            fs.writeFileSync('backend/backend.zip', buffer);
        }
    } catch (e) {
        /**
         * TODO: Possibly not good error handling, do later
         */
        if (e instanceof Error) {
            console.log(
                kleur.red(
                    `An error occurred while trying to get backend files: ${e.toString()}. This error is unrecoverable. Please, try again later`,
                ),
            );
        }

        s.stop();
        onError();
    }

    s.stop('Backend repository downloaded');
}

/**
 * @param {string} workingDirectory
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryMoveExtractedFiles(workingDirectory, onError) {
    errorWrap(
        () => shell.rm(`${workingDirectory}/backend/backend.zip`),
        null,
        'Failed to remove backend zip. This is a recoverable error. Please, remove it later manually.',
    );

    const getDirectories = /** @param {string} source */ (source) =>
        readdirSync(source, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

    const directories = getDirectories(`${workingDirectory}/backend`);
    const extractedDirectory = directories[0];

    errorWrap(
        () => shell.mv(`${workingDirectory}/backend/${extractedDirectory}/*`, `${workingDirectory}/backend`),
        onError,
        'Failed moving backend project directories',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/${extractedDirectory}`),
        null,
        'Failed to remove backend unzipped directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/pgx_ulid`),
        null,
        'Failed to remove fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm(`${workingDirectory}/backend/docker-compose.yml`),
        null,
        'Failed to remove fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/docker-entrypoint-initdb.d`),
        null,
        'Failed to remove fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    let env = backendEnv;
    try {
        env = env.replace('{db_password}', await generatePassword());
    } catch (e) {
        console.log(kleur.red(`Unable to generate strong password: ${e.message}`));
        onError();
    }

    writeFileOrError(`${workingDirectory}/backend/.env`, env, onError);
}

/**
 * @param {string} workingDirectory
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryPrepareProject(workingDirectory, onError) {
    errorWrap(() => shell.cd(`${workingDirectory}`), null, 'Failed to prepare project');
}
