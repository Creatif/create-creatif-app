#!/usr/bin/env node

import { intro, outro, group, text } from '@clack/prompts';
import {create} from "./index.js";

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
    })

    outro('You are all set!');
}

run();