import fs from 'fs';
import kleur from "kleur";
import { spinner as promptSpinner } from '@clack/prompts';

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
            console.log(kleur.red(`A ${response.status} error occurred while trying to get backend repository files. This error is unrecoverable. Please, try again later`))
            onError();
            s.stop();
            return;
        }

        if (response.ok) {
            const b = await response.blob();

            const buffer = Buffer.from( await b.arrayBuffer() );

            fs.writeFileSync('backend/backend.zip', buffer );
        }
    } catch (e) {
        /**
         * TODO: Possibly not good error handling, do later
         */
        if (e instanceof Error) {
            console.log(kleur.red(`An error occurred while trying to get backend files: ${e.toString()}. This error is unrecoverable. Please, try again later`))
        }

        s.stop();
        onError();
    }

    s.stop();
}