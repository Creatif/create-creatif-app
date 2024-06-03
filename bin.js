#!/usr/bin/env node
'use strict';

var prompts = require('@clack/prompts');
var shell = require('shelljs');
var kleur = require('kleur');
var fs = require('fs');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var StreamZip = require('node-stream-zip');

/**
 * @param {string} workingDirectory
 */
function onError(workingDirectory) {
    shell.rm('-rf', workingDirectory);
    shell.exit(1);
}

/**
 * @param {string} file
 * @param {string} content
 * @param {() => void} onError
 * */
function writeFileOrError(file, content, onError) {
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
 * @param {string} directory
 * @param {() => void} onError
 * */
function writeDirOrError(directory, onError) {
    try {
        fs.mkdirSync(directory);
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
function errorWrap(fn, onError, msg) {
    const blueprint = fn();

    if (blueprint.stderr) {
        console.log(kleur.red(`${msg}: ${blueprint.stderr}`));
        if (onError) {
            onError();
        }
    }

    return blueprint.stdout;
}

async function generatePassword(
    length = 20,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$',
) {
    const rnd = Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => characters[x % characters.length])
        .join('');

    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(rnd, salt);
}

const frontendEnv = `
APP_ENV=local

DATABASE_PASSWORD="{db_password}"
DATABASE_NAME=app
DATABASE_PORT=5432
DATABASE_HOST=db
DATABASE_USER=app

ASSETS_DIRECTORY=/app/assets
LOG_DIRECTORY=/app/var/log

SERVER_HOST=localhost
SERVER_PORT=3002

VITE_API_HOST=http://localhost:3002
`;

const backendEnv = `
APP_ENV=local

DATABASE_PASSWORD="{db_password}"
DATABASE_NAME=app
DATABASE_PORT=5432
DATABASE_HOST=db
DATABASE_USER=app

ASSETS_DIRECTORY=/app/assets
LOG_DIRECTORY=/app/var/log

SERVER_HOST=localhost
SERVER_PORT=3002
`;

const backendDockerfile = `
FROM golang:1.22.3-alpine as golang_build

ENV APP_DIR /app
WORKDIR /app

RUN apk add build-base

COPY go.mod .
COPY go.sum .

RUN go install github.com/cosmtrek/air@latest

RUN go mod download
RUN go mod tidy

COPY . .

EXPOSE 3002

CMD ["air", "-c", "/app/cmd/http/.air.toml"]
`;

const frontendDockerCompose = `
services:
  api:
    container_name: "api"
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
      - ./backend/assets:\${ASSETS_DIRECTORY}
      - ./backend/var/log:\${LOG_DIRECTORY}
    depends_on:
      - db
  db:
    image: "postgres"
    container_name: "db"
    ports:
      - "54333:5432"
    restart: always
    environment:
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_USER: \${DATABASE_USER}
  frontend:
    container_name: "frontend"
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

`;

const frontendDockerIgnore = `
node_modules
build
`;

const frontendDockerfile = `
FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install creatif-ui-sdk --save

COPY . .

FROM node:alpine AS development

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 5173

# Starting our application
CMD ["npm","run", "dev"]
`;

const indexHtml = `
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

const frontendGitignore = `
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

const prettier = `
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

const prettierIgnore = `
.git
.svn
.hg
node_modules
.next
yarn.lock
public
`;

const eslint = `
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

const eslintIgnore = `
node_modules
build
rollup.config.js
tsconfig.json
jest.config.js
tests
`;

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
        "vite-plugin-css-injected-by-js": "^3.5.1"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    }
}
`;

const viteConfig = `
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

const indexTsx = `
import App from './App';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
`;

const creatifProvider = `
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

const css = `
.fieldGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    align-content: center;
    gap: 1rem;

    margin-top: 1rem;
}

.houseDetailsHeader {
    margin: 2rem 0 1rem 0;
    padding-bottom: 0.5rem;
    font-size: 1rem;

    font-weight: bold;
    border-bottom: 1px solid lightgray;
}

.accountNote {
    margin-top: 2rem;
    padding-top: 1rem;

    border-top: 1px solid lightgray;
}

.submitButton {
    display: flex;
    justify-content: flex-end;

    margin-top: 3rem;
}
`;

const propertyForm = `
import { Form, InputText, InputSelectControlled, InputTextarea } from 'creatif-ui-sdk';
import { HouseForm } from './components/HouseForm';
import { ApartmentForm } from './components/ApartmentForm';
import css from './css/root.module.css';
import { StudioForm } from './components/StudioForm';
import { LandForm } from './components/LandForm';

export function PropertyForm() {
    return (
        <Form<{
            address: string;
            city: string;
            postalCode: string;
            propertyStatus: 'Rent' | 'Sell' | 'Rent business' | '';
            propertyType: 'House' | 'Apartment' | 'Studio' | 'Land' | '';

            numOfHouseFloors: number | null;
            houseSize: number | null;
            houseLocalPrice: number | null;
            houseBackYard: boolean;
            houseNeedsRepair: boolean;
            houseBackYardSize: number;
            houseRepairNote: string;

            apartmentFloorNumber: number | null;
            apartmentSize: number | null;
            apartmentLocalPrice: number | null;
            apartmentBalcony: boolean;
            apartmentBalconySize: number | null;

            studioFloorNumber: number | null;
            studioSize: number | null;

            landSize: number | null;
            hasConstructionPermit: number | null;
        }>
            bindings={{
                name: (values) => \`\${values.address}-\${values.city}-\${values.postalCode}\`,
            }}
            formProps={{
                defaultValues: {
                    address: '',
                    city: '',
                    postalCode: '',
                    propertyStatus: '',
                    propertyType: '',

                    numOfHouseFloors: null,
                    houseSize: null,
                    houseLocalPrice: null,
                    houseBackYard: false,
                    houseNeedsRepair: false,
                    houseBackYardSize: null,
                    houseRepairNote: '',

                    apartmentFloorNumber: null,
                    apartmentSize: null,
                    apartmentLocalPrice: null,
                    apartmentBalcony: false,
                    apartmentBalconySize: null,

                    studioFloorNumber: null,
                    studioSize: null,

                    hasConstructionPermit: null,
                    landSize: null,
                },
            }}
            inputs={(submitButton, { watch, inputReference }) => {
                const propertyType = watch('propertyType');

                return (
                    <>
                        {inputReference({
                            structureName: 'Accounts',
                            name: 'accounts',
                            structureType: 'map',
                            label: 'Account',
                            validation: {
                                required: 'Selecting an owner is required',
                            },
                        })}

                        <div>
                            <div className={css.fieldGrid}>
                                <div>
                                    <InputText
                                        label="Address"
                                        name="address"
                                        options={{
                                            required: 'Address is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputText
                                        label="City"
                                        name="city"
                                        options={{
                                            required: 'City is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputText
                                        label="Postal code"
                                        name="postalCode"
                                        options={{
                                            required: 'Postal code is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputSelectControlled
                                        data={['Rent', 'Sell', 'Rent business']}
                                        label="Property status"
                                        name="propertyStatus"
                                        validation={{
                                            required: 'Property status is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputSelectControlled
                                        data={['House', 'Apartment', 'Studio', 'Land']}
                                        label="Property type"
                                        name="propertyType"
                                        validation={{
                                            required: 'Property type is required',
                                        }}
                                    />
                                </div>
                            </div>

                            {propertyType === 'Apartment' && <ApartmentForm />}
                            {propertyType === 'House' && <HouseForm />}
                            {propertyType === 'Studio' && <StudioForm />}
                            {propertyType === 'Land' && <LandForm />}
                        </div>

                        <div className={css.accountNote}>
                            <InputTextarea
                                label="Account note"
                                name="finalNote"
                                description="Describe anything that could not be represented in the fields above"
                            />
                        </div>

                        <div className={css.submitButton}>{submitButton}</div>
                    </>
                );
            }}
        />
    );
}
`;

const apartmentForm = `
import { InputCheckbox, InputNumberControlled } from 'creatif-ui-sdk';
import { useCreatifFormContext } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function ApartmentForm() {
    const { watch } = useCreatifFormContext();
    const apartmentBalcony = watch('apartmentBalcony');

    return (
        <div>
            <h1 className={css.houseDetailsHeader}>APARTMENT DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="apartmentFloorNumber"
                        label="Floor number"
                        validation={{
                            required: 'Floor number is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="apartmentSize"
                        label="Size (in meters squared)"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="apartmentLocalPrice"
                        label="Local price (in meters squared)"
                        validation={{
                            required: 'Local price is required',
                        }}
                    />
                </div>

                <div>
                    <InputCheckbox name="apartmentBalcony" label="Has balcony?" />
                </div>
            </div>

            <div className={css.fieldGrid}>
                {apartmentBalcony && (
                    <div>
                        <InputNumberControlled
                            name="apartmentBalconySize"
                            label="Balcony size"
                            validation={{
                                required: 'Balcony size is required',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
`;

const houseForm = `
import { InputCheckbox, InputNumberControlled, InputTextarea } from 'creatif-ui-sdk';
import { useCreatifFormContext } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function HouseForm() {
    const { watch } = useCreatifFormContext();

    const backYard = watch('houseBackYard');
    const needsRepair = watch('houseNeedsRepair');

    return (
        <div>
            <h1 className={css.houseDetailsHeader}>HOUSE DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="numOfHouseFloors"
                        label="Number of floors"
                        validation={{
                            required: 'Number of floors is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="houseSize"
                        label="Size"
                        description="In meters squared"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="houseLocalPrice"
                        label="Local price"
                        description="Per meters squared"
                        validation={{
                            required: 'Local price is required',
                        }}
                    />
                </div>

                <div>
                    <InputCheckbox name="houseBackYard" label="Has back yard?" />
                </div>

                <div>
                    <InputCheckbox name="houseNeedsRepair" label="Need repair?" />
                </div>
            </div>

            <div className={css.fieldGrid}>
                {backYard && (
                    <div>
                        <InputNumberControlled
                            name="houseBackYardSize"
                            label="Back yard size"
                            description="Size in meters squared"
                            validation={{
                                required: 'Back yard size is required',
                            }}
                        />
                    </div>
                )}

                {needsRepair && (
                    <div
                        style={{
                            gridColumn: 'span 2',
                        }}>
                        <InputTextarea
                            description="The description should be as detailed as possible"
                            resize="both"
                            autosize={true}
                            minRows={2}
                            maxRows={10}
                            name="houseRepairNote"
                            label="Describe the repairs"
                            options={{
                                required: 'Note is required',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
`;

const studioForm = `
import { InputNumberControlled } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function StudioForm() {
    return (
        <div>
            <h1 className={css.houseDetailsHeader}>STUDIO DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="studioFloorNumber"
                        label="Floor number"
                        validation={{
                            required: 'Floor number is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="studioSize"
                        label="Size (in meters squared)"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
`;

const landForm = `
import { InputCheckbox, InputNumberControlled } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function LandForm() {
    return (
        <div>
            <h1 className={css.houseDetailsHeader}>APARTMENT DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="landSize"
                        label="Size (in meters squared)"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>

                <div>
                    <InputCheckbox name="hasConstructionPermit" label="Has construction Permit?" />
                </div>
            </div>
        </div>
    );
}
`;

const accountForm = `
import { Form, InputText } from 'creatif-ui-sdk';
import css from './css/root.module.css';
export function AccountForm() {
    return (
        <Form<{
            name: string;
            lastName: string;
            address: string;
            city: string;
            postalCode: string;
        }>
            bindings={{
                name: (values) => \`\${values.name}-\${values.lastName}-\${values.address}\`,
            }}
            formProps={{
                defaultValues: {
                    name: '',
                    lastName: '',
                    address: '',
                    city: '',
                    postalCode: '',
                },
            }}
            inputs={(submitButton) => (
                <>
                    <div className={css.fieldGrid}>
                        <div>
                            <InputText
                                label="Name"
                                name="name"
                                options={{
                                    required: 'Name is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="Last name"
                                name="lastName"
                                options={{
                                    required: 'Last name is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="Address"
                                name="address"
                                options={{
                                    required: 'Address is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="City"
                                name="city"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="Postal code"
                                name="postalCode"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </div>
                    </div>

                    <div className={css.submitButton}>{submitButton}</div>
                </>
            )}
        />
    );
}
`;

const starterApp = `
import React from 'react';
import { CreatifProvider } from 'creatif-ui-sdk';
import { PropertyForm } from './PropertyForm';
import { AccountForm } from './AccountForm';

export default function App() {
    return (
        <CreatifProvider
            app={{
                logo: 'Real Estate Manager',
                projectName: 'project',
                items: [
                    {
                        structureType: 'map',
                        structureName: 'Properties',
                        form: <PropertyForm />,
                    },
                    {
                        structureType: 'map',
                        structureName: 'Accounts',
                        form: <AccountForm />,
                    },
                ],
            }}
        />
    );
}

`;

/**
 * @param {string} path
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
async function tryUnzipBackend(path, onError) {
    const s = prompts.spinner();
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
async function tryWriteBackendZip(onError) {
    const s = prompts.spinner();
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
async function tryMoveExtractedFiles(workingDirectory, onError) {
    errorWrap(
        () => shell.rm(`${workingDirectory}/backend/backend.zip`),
        null,
        'Failed to remove backend zip. This is a recoverable error. Please, remove it later manually.',
    );

    const getDirectories = /** @param {string} source */ (source) =>
        fs.readdirSync(source, { withFileTypes: true })
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
        'Failed to backend unzipped directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/pgx_ulid`),
        null,
        'Failed to fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/docker-entrypoint-initdb.d`),
        null,
        'Failed to fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/Dockerfile`),
        null,
        'Failed to fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    errorWrap(
        () => shell.rm('-rf', `${workingDirectory}/backend/docker-compose.yml`),
        null,
        'Failed to fully prepare backend directory. This is a recoverable error. Please, remove it later manually.',
    );

    writeFileOrError(`${workingDirectory}/backend/Dockerfile`, backendDockerfile, onError);
}

/**
 * @param {string} workingDirectory
 * @param {string} projectName
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
async function tryPrepareProject(workingDirectory, projectName, onError) {
    const s = prompts.spinner();
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
    writeFileOrError(`${workingDirectory}/.dockerignore`, frontendGitignore, onError);
    writeFileOrError(`${workingDirectory}/index.html`, indexHtml, onError);
    writeFileOrError(`${workingDirectory}/package.json`, packageJson.replace('{project_name}', projectName), onError);
    createRequiredDirectories(workingDirectory, onError);
    writeFileOrError(`${workingDirectory}/src/index.tsx`, indexTsx, onError);
    writeFileOrError(`${workingDirectory}/src/App.tsx`, creatifProvider.replace('{project_name}', projectName), onError);

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
async function tryCreateStarterProject(workingDirectory, onError) {
    writeDirOrError(`${workingDirectory}/src/components`, onError);
    writeDirOrError(`${workingDirectory}/src/css`, onError);

    writeFileOrError(`${workingDirectory}/src/css/root.module.css`, css, onError);
    writeFileOrError(`${workingDirectory}/src/components/ApartmentForm.tsx`, apartmentForm, onError);
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

/**
 * 1. Create templates directory and its content
 *    1.1 Create template for package.json
 *    1.2 Create template for frontend Dockerfile
 *    1.3 Create template for backend Dockerfile
 *    1.4 Create template for entire projects docker compose
 *    1.5 Create template for src/index.tsx
 *    1.6 Create template for backend .env
 *    1.7 Create template for frontend .env
 * 2. Stages
 *    The user should be prompted to specify the app directory (current dir is the default).
 *    The user should be prompted for the name of the project that will later on become
 *    the projectName in CreatifProvider configuration.
 *    The user should be prompted for basic information to create package.json.
 *    Same as npm init.
 *
 *    2.1 Create the user specified app directory and 'cd' into it (using shelljs)
 *    2.2 Download backend git tarball and unpack it in backend directory (create backend directory in this stage)
 *    2.3 Delete docker compose file for the backend
 *    2.4 Create .env backend file from template, generate secure database password
 *    2.5 Create .env frontend file from template
 *    2.6 Create docker-compose file for the entire project
 *    2.7 Create src directory and index.tsx from the template. This stage
 *        should contain CreatifProvider without any items (there will be no starter app)
 *
 * bin.js should contain code that only interacts with the user. index.js contains the create()
 * function that will create and scaffold the project.
 *
 * Required prompts:
 * - app directory (default is current)
 * - project name
 */


/** @type {import('./types/index.js').create} */
async function create(options) {
    const currentDirectory = errorWrap(() => shell.pwd(), null, 'Failed trying to get current directory with pwd');
    let workingDirectory = currentDirectory;

    if (options.appDirectory) {
        workingDirectory = `${currentDirectory}/${options.appDirectory}`;
        errorWrap(() => shell.mkdir(workingDirectory), null, 'Failed creating app directory');
    }

    const onErrorCallback = () => onError(workingDirectory);

    errorWrap(() => shell.cd(workingDirectory), onErrorCallback, 'Failed trying to cd into directory');
    errorWrap(() => shell.mkdir('backend'), onErrorCallback, 'Failed trying to create backend directory');

    await runStages(workingDirectory, options.projectName, onErrorCallback);

    if (options.hasStarterProject) {
        await tryCreateStarterProject(workingDirectory, onErrorCallback);
    }
}

/**
 * @param {string} workingDirectory
 * @param {string} projectName
 * @param {() => void} onError
 * @returns {Promise<void>}
 */
async function runStages(workingDirectory, projectName, onError) {
    await tryWriteBackendZip(onError);
    await tryUnzipBackend(`${workingDirectory}/backend/backend.zip`, onError);
    await tryMoveExtractedFiles(workingDirectory, onError);
    await tryPrepareProject(workingDirectory, projectName, onError);
}

async function run() {
    prompts.intro(`Welcome to Creatif CLI project scaffolding`);

    const g = await prompts.group(
        {
            appDirectory: () => prompts.text({
                message: 'What is your app directory?',
                placeholder: 'Leave blank for the current directory'
            }),
            projectName: () => prompts.text({
                message: 'What is your project name?',
                placeholder: 'Leave blank and app directory will be chosen',
                validate(value) {
                    if (value.length < 1 && value.length > 200) return `Project name must have between 1 and 200 characters.`;
                },
            }),
            hasStarterProject: () => prompts.confirm({
                message: 'Would you like to setup a starter project? (you can delete it later)',
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
        hasStarterProject: g.hasStarterProject,
    });

    prompts.outro(`
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
