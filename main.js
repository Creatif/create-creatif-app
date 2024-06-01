#!/usr/bin/env node

import { intro, outro, group, text } from '@clack/prompts';
import {create} from "./index.js";
import kleur from "kleur";

async function run() {
    intro(`Welcome to Creatif CLI project scaffolding`);

    const g = await group(
        {
            appDirectory: () => text({
                message: 'What is your app directory?',
                placeholder: 'Leave blank for the current directory'
            }),
            projectName: () => text({
                message: 'What is your project name?',
                placeholder: 'Leave blank and app directory will be chosen',
                validate(value) {
                    if (value.length < 1 && value.length > 200) return `Project name must have between 1 and 200 characters.`;
                },
            }),
        },
        {
            onCancel: () => {
                process.exit(0);
            },
        }
    );

    await create({
        appDirectory: g.appDirectory,
        projectName: g.projectName || g.appDirectory,
    });

    const serverHighlight =  kleur.red(`⇨ http server started on [::]:3002`);

    outro(`
    ${kleur.green(`You are all set!`)}
    
    Next steps:
    1. cd into ${kleur.blue(`${g.appDirectory}`)}
    2. Run ${kleur.blue(`docker compose up`)}
    
    Creatif will be available on ${kleur.green(`http://localhost:5173`)}
    
    NOTE: Sometimes, the backend server can take longer to build
    than the fronted. After you see this message:
    
    ${kleur.yellow(`⇨ http server started on [::]:3002`)}
    
    the backend server is ready. 
`);
}

run();