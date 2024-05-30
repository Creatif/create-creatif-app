import { spinner as promptSpinner } from '@clack/prompts';
import StreamZip from 'node-stream-zip';
import kleur from 'kleur';
import fs from 'fs';
import { errorWrap, generatePassword, writeFileOrError } from './util.js';
import shell from 'shelljs';
import { readdirSync } from 'fs';
import {
    backendEnv,
    creatifProvider,
    eslint,
    eslintIgnore,
    frontendDockerCompose,
    frontendDockerfile, frontendDockerIgnore, frontendEnv,
    frontendGitignore,
    indexHtml, indexTsx,
    packageJson,
    prettier,
    prettierIgnore,
    viteConfig
} from './templates/templates.js';

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
        await zip.extract(null, 'backend');
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
        () => shell.rm('-rf', `${workingDirectory}/backend/docker-entrypoint-initdb.d`),
        null,
        'Failed to remove fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    let env = backendEnv;
    try {
        env = env.replace('{db_password}', await generatePassword());
    } catch (e) {
        if (e instanceof Error) {
            console.log(kleur.red(`Unable to generate strong password: ${e.message}`));
            onError();
            return;
        }

        console.log(kleur.red(`Something wrong happened. Please, try again.`));
        onError();
    }

    writeFileOrError(`${workingDirectory}/backend/.env`, env, onError);
}

/**
 * @param {string} workingDirectory
 * @param {string} projectName
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryPrepareProject(workingDirectory, projectName, onError) {
    const s = promptSpinner();
    s.start('Preparing project...');

    writeFileOrError(`${workingDirectory}/.eslintrc.json`, eslint, onError);
    writeFileOrError(`${workingDirectory}/.env`, frontendEnv, onError);
    writeFileOrError(`${workingDirectory}/.eslintignore`, eslintIgnore, onError);
    writeFileOrError(`${workingDirectory}/.prettierrc`, prettier, onError);
    writeFileOrError(`${workingDirectory}/.prettierignore`, prettierIgnore, onError);
    writeFileOrError(`${workingDirectory}/.gitignore`, frontendGitignore, onError);
    writeFileOrError(`${workingDirectory}/vite.config.mjs`, viteConfig, onError);
    writeFileOrError(`${workingDirectory}/Dockerfile`, frontendDockerfile, onError);
    writeFileOrError(`${workingDirectory}/docker-compose.yml`, frontendDockerCompose, onError);
    writeFileOrError(`${workingDirectory}/.dockerignore`, frontendDockerIgnore, onError);
    writeFileOrError(`${workingDirectory}/.dockerignore`, frontendGitignore, onError);
    writeFileOrError(`${workingDirectory}/index.html`, indexHtml, onError);
    writeFileOrError(`${workingDirectory}/package.json`, packageJson.replace('{project_name}', projectName), onError);
    createRequiredDirectories(workingDirectory, onError);
    writeFileOrError(`${workingDirectory}/src/index.tsx`, indexTsx, onError);
    writeFileOrError(`${workingDirectory}/src/App.tsx`, creatifProvider.replace('{project_name}', projectName), onError);

    s.stop('Project prepared');
}

/**
 * @param {string} workingDirectory
 * @param {() => void} onError
 */
function createRequiredDirectories(workingDirectory, onError) {
    try {
        fs.mkdirSync(`${workingDirectory}/src`);
    } catch (e) {
        if (e instanceof Error) {
            console.log(kleur.red(`Cannot create required directories: ${e.message}`));
            onError();
            return;
        }

        console.log(kleur.red(`Something wrong happened. Please, try again.`));
        onError();
    }
}
