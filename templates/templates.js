export const frontendEnv = `
APP_ENV=local

VITE_FRONTEND_HOST=http://localhost:5173
VITE_API_HOST=http://localhost:3002

DATABASE_PASSWORD='{db_password}'
DATABASE_NAME=app
DATABASE_PORT=5432
DATABASE_HOST=creatif_db
DATABASE_USER=app

SERVER_HOST=localhost
SERVER_PORT=3002
`;

export const backendEnv = `
DATABASE_PASSWORD='{db_password}'
DATABASE_NAME=app
DATABASE_PORT=5432
DATABASE_HOST=creatif_db
DATABASE_USER=app

SERVER_HOST=localhost
SERVER_PORT=3002

APP_ENV=local
`;

export const backendDockerfile = `
FROM golang:1.22.3-alpine as golang_build

ENV APP_DIR /app
WORKDIR /app

RUN apk add build-base

COPY go.mod .
COPY go.sum .

RUN go install github.com/air-verse/air@latest

RUN go mod download
RUN go mod tidy

COPY . .

EXPOSE 3002

CMD ["air", "-c", "/app/cmd/http/.air.toml"]
`;

export const frontendDockerCompose = `
services:
  creatif_api:
    container_name: "creatif_api"
    build:
      context: backend
      dockerfile: Dockerfile
    env_file: .env
    restart: no
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      - 3002:3002
    volumes:
      - ./backend:/app
      - ./backend:/assets:/app/assets
      - ./backend:/public:/app/public
      - ./backend:/var/log:/app/var/log
      - ./backend:/var/assets:/app/var/assets
    depends_on:
      creatif_db:
        condition: service_healthy
    healthcheck:
      test: [ "CMD-SHELL", "curl -i http://api:3002/api/v1/health/full-health || { echo 'Health check failed with code $?'; exit 1; }" ]
      interval: 5s
      timeout: 5s
      retries: 10
  creatif_db:
    image: "postgres:17-alpine"
    container_name: "creatif_db"
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U app" ]
      interval: 5s
      timeout: 5s
      retries: 5
    ports:
      - "54333:5432"
    restart: always
    environment:
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_USER: \${DATABASE_USER}
  creatif_frontend:
    container_name: "creatif_frontend"
    build:
      context: .
      dockerfile: Dockerfile
    env_file: .env
    restart: no
    stdin_open: true
    volumes:
      - ./src:/app/src
    ports:
      - 5173:5173
    expose:
      - 5173
    depends_on:
      creatif_db: 
        condition: service_healthy
      creatif_api:
        condition: service_started
`;

export const frontendDockerIgnore = `
node_modules
build
backend/.git
`;

export const frontendDockerfile = `
FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --force --verbose
RUN npm install creatif-ui-sdk quill@2.0.2 --save --force --verbose

COPY . .

FROM node:alpine AS development

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 5173

# Starting our application
CMD ["npm","run", "dev"]
`;

export const indexHtml = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite App</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet" />
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/index.tsx"></script>
    </body>
</html>
`;

export const frontendGitignore = `
.idea
.vscode
node_modules

.env*
.env
# dependencies
/node_modules
/.pnp
.pnp.js
.idea
# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

export const backendGitignore = `
var
.env
.env.test
pubsub-debug*
database-debug*
storage.rules
ui-debug.log
cmd/http/go_api_build
.idea
coverprofile.o
`;

export const prettier = `
{
    "tabWidth": 4,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 120,
    "endOfLine": "auto",
    "bracketSameLine": true,
    "overrides": [
        {
            "files": ["*.js", "*.tsx", "*.ts"],
            "options": {
                "tabWidth": 4
            }
        }
    ]
}
`;

export const prettierIgnore = `
.git
.svn
.hg
node_modules
.next
yarn.lock
public
`;

export const eslint = `
{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:import/errors",
        "plugin:import/warnings"
    ],
    "overrides": [],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": ["react", "@typescript-eslint", "import"],
    "rules": {
        "react/react-in-jsx-scope": "off",
        "react/no-unknown-property": "off",
        "import/no-unresolved": "off",
        "indent": "off",
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "arrow-body-style": ["error", "as-needed"],
        "react/self-closing-comp": ["error", { "component": true, "html": true }],
        "@typescript-eslint/consistent-type-imports": [
            "error",
            {
                "prefer": "type-imports"
            }
        ],
        "no-restricted-imports": [
            "error",
            {
                "patterns": ["../"]
            }
        ]
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
}
`;

export const eslintIgnore = `
node_modules
build
rollup.config.js
tsconfig.json
jest.config.js
tests
`;

export const packageJson = `
{
  "name": "{project_name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
      "dev": "vite --host 0.0.0.0 --mode development"
  },
  "devDependencies": {
        "@babel/preset-env": "7.22.7",
        "@babel/preset-react": "7.22.5",
        "@babel/preset-typescript": "7.22.5",
        "@rollup/plugin-commonjs": "25.0.7",
        "@types/node": "20.5.7",
        "@types/react": "18.2.14",
        "@types/react-dom": "18.2.6",
        "@typescript-eslint/eslint-plugin": "6.0.0",
        "@typescript-eslint/parser": "6.0.0",
        "@vitejs/plugin-react": "4.2.1",
        "eslint": "8.44.0",
        "eslint-config-prettier": "8.8.0",
        "eslint-plugin-import": "2.27.5",
        "eslint-plugin-react": "7.32.2",
        "postcss": "8.4.31",
        "postcss-preset-mantine": "1.11.0",
        "postcss-simple-vars": "7.0.1",
        "prettier": "3.0.0",
        "rollup": "4.10.0",
        "rollup-plugin-cleanup": "3.2.1",
        "rollup-plugin-typescript2": "0.36.0",
        "ts-node": "10.9.1",
        "typescript": "5.1.6",
        "vite": "5.1.1",
        "vite-plugin-dts": "3.6.4",
        "vite-plugin-css-injected-by-js": "3.5.1"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    }
}
`;

export const viteConfig = `
import path, { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        cssInjectedByJsPlugin(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    resolve: {
        alias: {
            '@root': join(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'build',
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, 'src/index.tsx'),
            fileName: 'index',
            formats: ['es']
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['react', 'react-dom'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
});
`;

export const indexTsx = `
import App from './App';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
`;

export const creatifProvider = `
import { CreatifProvider } from 'creatif-ui-sdk';

export default function App() {
    return (
        <CreatifProvider
            app={{
                projectName: '{project_name}',
                items: []
            }}
        />
    );
}
`;

export const singleWorker = `
onmessage = (e) => {
    const file = e.data;
    if (typeof file === 'string') {
        toBase64(file).then((result) => {
            if (result) {
                postMessage({
                    isUpdate: true,
                    result: result,
                });
            }
        });

        return;
    }

    let result = {
        result: undefined,
        error: undefined,
    };
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = async () => {
        const arr = new Uint8Array(reader.result);
        const str = arr.reduce((data, byte) => data + String.fromCharCode(byte), '');

        const split = file.name.split('.');
        let data = \`data:\${file.type}\`;
        if (split.length > 1) {
            data = \`data:\${file.type}#\${split[split.length - 1]}\`;
        }

        result.result = \`\${data};base64,\${btoa(str)}\`;
        result.name = file.name;
        result.size = file.size;
        result.type = file.type;

        postMessage({
            isUpdate: false,
            result: result,
        });
    };

    reader.onerror = () => {
        result.error = 'An error occurred while trying to create base64 image representation';

        postMessage({
            isUpdate: false,
            result: result,
        });
    };
};

function toFileReaderPromise(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);

        reader.onloadend = async () => {
            const arr = new Uint8Array(reader.result);
            const str = arr.reduce((data, byte) => data + String.fromCharCode(byte), '');

            resolve(btoa(str));
        };

        reader.onerror = () => {
            reject('Could not load blob');
        };
    });
}

async function toBase64(url) {
    let result = {
        result: undefined,
        error: undefined,
    };

    try {
        const response = await fetch(url, {
            method: 'get',
            credentials: 'include',
            cache: 'no-cache',
        });

        const blob = await response.blob();

        result.result = await toFileReaderPromise(blob);
        result.size = blob.size;
        result.type = blob.type;

        return result;
    } catch (e) {
        result.error = e.message;
        return result;
    }
}
`;

export const multipleUploadsWorker = `
onmessage = async (e) => {
    const files = e.data;
    let areUrlsOnly = files.every((f) => Object.hasOwn(f, 'id') && Object.hasOwn(f, 'url'));

    let result = {
        result: [],
        error: undefined,
    };

    if (areUrlsOnly) {
        const results = [];
        const promises = [];
        for (const f of files) {
            promises.push(toBase64(f));
        }

        try {
            const resolvedPromises = await Promise.all(promises);

            for (const p of resolvedPromises) {
                if (p.error) {
                    return {
                        error: p.error,
                    };
                }

                results.push(p);
            }
        } catch (e) {
            results.push({
                error: e.message,
            });
        }

        postMessage({
            isUpdate: true,
            result: results,
        });

        return;
    }

    const results = [];
    for (const file of files) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        const singleResult = await promisifySingleConversion(file);

        if (singleResult.error) {
            return {
                error: singleResult.error,
            };
        }

        results.push(singleResult);
    }

    result.result = results;

    postMessage(result);
};

function promisifySingleConversion(file) {
    let result = {
        result: undefined,
        error: undefined,
    };

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    return new Promise((resolve) => {
        reader.onloadend = async () => {
            const arr = new Uint8Array(reader.result);
            const str = arr.reduce((data, byte) => data + String.fromCharCode(byte), '');

            const split = file.name.split('.');
            let data = \`data:\${file.type}\`;
            if (split.length > 1) {
                data = \`data:\${file.type}#\${split[split.length - 1]}\`;
            }

            result.result = \`\${data};base64,\${btoa(str)}\`;
            result.name = file.name;
            result.size = file.size;
            result.type = file.type;

            resolve(result);
        };

        reader.onerror = () => {
            result.error = 'An error occurred while trying to create base64 image representation';

            resolve(result);
        };
    });
}

async function toBase64(url) {
    let result = {
        result: undefined,
        error: undefined,
    };

    try {
        const response = await fetch(url.url, {
            method: 'get',
            credentials: 'include',
            cache: 'no-cache',
        });

        const blob = await response.blob();

        result.result = await toFileReaderPromise(blob);
        result.size = blob.size;
        result.id = url.id;
        result.type = blob.type;

        return result;
    } catch (e) {
        result.error = e.message;
        return result;
    }
}

function toFileReaderPromise(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);

        reader.onloadend = async () => {
            const arr = new Uint8Array(reader.result);
            const str = arr.reduce((data, byte) => data + String.fromCharCode(byte), '');

            resolve(btoa(str));
        };

        reader.onerror = () => {
            reject('Could not load blob');
        };
    });
}

`;
