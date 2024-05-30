import { intro, outro, group, text, cancel } from '@clack/prompts';
import {create} from "./index.js";

const packageJson = `
{
  "name": "{project_name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
      "dev": "vite --host 0.0.0.0 --mode development"
  },
  "devDependencies": {
        "@babel/preset-env": "^7.22.7",
        "@babel/preset-react": "^7.22.5",
        "@babel/preset-typescript": "^7.22.5",
        "@rollup/plugin-commonjs": "^25.0.7",
        "@types/node": "^20.5.7",
        "@types/react": "^18.2.14",
        "@types/react-dom": "^18.2.6",
        "@typescript-eslint/eslint-plugin": "^6.0.0",
        "@typescript-eslint/parser": "^6.0.0",
        "@vitejs/plugin-react": "^4.2.1",
        "eslint": "^8.44.0",
        "eslint-config-prettier": "^8.8.0",
        "eslint-plugin-import": "^2.27.5",
        "eslint-plugin-react": "^7.32.2",
        "creatif-ui-sdk": "^0.0.1",
        "postcss": "^8.4.31",
        "postcss-preset-mantine": "^1.11.0",
        "postcss-simple-vars": "^7.0.1",
        "prettier": "^3.0.0",
        "rollup": "^4.10.0",
        "rollup-plugin-cleanup": "^3.2.1",
        "rollup-plugin-typescript2": "^0.36.0",
        "ts-node": "^10.9.1",
        "typescript": "^5.1.6",
        "vite": "^5.1.1",
        "vite-plugin-dts": "^3.6.4",
        "vite-plugin-lib-inject-css": "^2.1.1"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    }
}
`;

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