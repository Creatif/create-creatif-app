import { spinner as promptSpinner } from '@clack/prompts';
import { simpleGit } from 'simple-git';
import StreamZip from 'node-stream-zip';
import kleur from 'kleur';
import fs from 'fs';
import { errorWrap, generatePassword, writeDirOrError, writeFileOrError } from './util.js';
import shell from 'shelljs';
import {
    backendDockerfile,
    backendEnv,
    creatifProvider,
    eslint,
    eslintIgnore,
    frontendDockerCompose,
    frontendDockerfile,
    frontendDockerIgnore,
    frontendEnv,
    frontendGitignore,
    indexHtml,
    indexTsx,
    multipleUploadsWorker,
    packageJson,
    prettier,
    prettierIgnore,
    singleWorker,
    viteConfig,
} from './templates/templates.js';
import { css } from './templates/starterProject/css.js';
import {
    accountForm,
    apartmentForm,
    houseForm,
    landForm,
    propertyForm,
    richTextEditor,
    studioForm,
} from './templates/starterProject/forms.js';
import { starterApp } from './templates/starterProject/app.js';

/**
 * @param {string} workingDirectory
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryCreateBackend(workingDirectory, onError) {
    const s = promptSpinner();
    s.start('Downloading backend files...');
    try {
        const backendDir = `${workingDirectory}/backend`;
        errorWrap(() => shell.cd(backendDir), onError, 'Failed trying to cd into directory');

        const git = simpleGit();
        await git.init();
        await git.addRemote('origin', 'git@github.com:Creatif/creatif-backend.git');
        await git.pull('origin', 'master');
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
 * @param {string} projectName
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryPrepareProject(workingDirectory, projectName, onError) {
    const s = promptSpinner();
    s.start('Preparing project...');

    writeFileOrError(`${workingDirectory}/.eslintrc.json`, eslint, onError);
    writeFileOrError(`${workingDirectory}/.eslintignore`, eslintIgnore, onError);
    writeFileOrError(`${workingDirectory}/.prettierrc`, prettier, onError);
    writeFileOrError(`${workingDirectory}/.prettierignore`, prettierIgnore, onError);
    writeFileOrError(`${workingDirectory}/.gitignore`, frontendGitignore, onError);
    writeFileOrError(`${workingDirectory}/vite.config.mjs`, viteConfig, onError);
    writeFileOrError(`${workingDirectory}/Dockerfile`, frontendDockerfile, onError);
    writeFileOrError(`${workingDirectory}/docker-compose.yml`, frontendDockerCompose, onError);
    writeFileOrError(`${workingDirectory}/.dockerignore`, frontendDockerIgnore, onError);
    writeFileOrError(`${workingDirectory}/index.html`, indexHtml, onError);
    writeFileOrError(`${workingDirectory}/package.json`, packageJson.replace('{project_name}', projectName), onError);
    createRequiredDirectories(workingDirectory, onError);
    writeFileOrError(`${workingDirectory}/src/index.tsx`, indexTsx, onError);
    writeFileOrError(
        `${workingDirectory}/src/App.tsx`,
        creatifProvider.replace('{project_name}', projectName),
        onError,
    );

    try {
        const dbPassword = await generatePassword();
        const env = frontendEnv.replace('{db_password}', dbPassword);

        writeFileOrError(`${workingDirectory}/.env`, env, onError);
        writeFileOrError(`${workingDirectory}/backend/.env`, backendEnv.replace('{db_password}', dbPassword), onError);
    } catch (e) {
        if (e instanceof Error) {
            console.log(kleur.red(`Unable to generate strong password: ${e.message}`));
            onError();
            return;
        }

        console.log(kleur.red(`Something wrong happened. Please, try again.`));
        onError();
    }

    s.stop('Project prepared');
}

/**
 * @param {string} workingDirectory
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
export async function tryCreateStarterProject(workingDirectory, onError) {
    writeDirOrError(`${workingDirectory}/src/components`, onError);
    writeDirOrError(`${workingDirectory}/src/css`, onError);

    writeFileOrError(`${workingDirectory}/src/css/root.module.css`, css, onError);
    writeFileOrError(`${workingDirectory}/singleUploadWorker.js`, singleWorker, onError);
    writeFileOrError(`${workingDirectory}/multipleUploadsWorker.js`, multipleUploadsWorker, onError);
    writeFileOrError(`${workingDirectory}/src/components/ApartmentForm.tsx`, apartmentForm, onError);
    writeFileOrError(`${workingDirectory}/src/components/RichTextEditor.tsx`, richTextEditor, onError);
    writeFileOrError(`${workingDirectory}/src/components/LandForm.tsx`, landForm, onError);
    writeFileOrError(`${workingDirectory}/src/components/StudioForm.tsx`, studioForm, onError);
    writeFileOrError(`${workingDirectory}/src/components/HouseForm.tsx`, houseForm, onError);

    writeFileOrError(`${workingDirectory}/src/AccountForm.tsx`, accountForm, onError);
    writeFileOrError(`${workingDirectory}/src/PropertyForm.tsx`, propertyForm, onError);
    writeFileOrError(`${workingDirectory}/src/App.tsx`, starterApp, onError);
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
