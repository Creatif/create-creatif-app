import { intro, outro, group, text, cancel } from '@clack/prompts';
import {create} from "./index.js";

async function run() {
    intro(`Welcome to Creatif CLI project scaffolding`);

    const g = await group(
        {
            appDirectory: () => text({
                message: 'In what directory should the project be created?',
                placeholder: 'Leave blank for the current directory'
            }),
            projectName: () => text({
                message: 'What would be your project name',
                placeholder: 'Leave blank and \'myProject\' will be chosen',
                initialValue: 'myProject',
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
        projectName: g.projectName,
    })

    outro('You are all set!');
}

run();