export const backendEnv = `
APP_ENV=local

DATABASE_PASSWORD={db_password}
DATABASE_USER=api
DATABASE_HOST=db
DATABASE_NAME=api
DATABASE_PORT=5432

SERVER_HOST=localhost
SERVER_PORT=3002

LOG_DIRECTORY=/app/var/log
ASSETS_DIRECTORY=/app/assets
`;

export const dockerCompose = `
version: "3.9"
services:
  api:
    container_name: "api"
    build:
      context: ./backend
      dockerfile: Dockerfile
    env_file: ./backend/.env
    restart: no
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      - 3002:3002
    volumes:
      - .:/app
      - .:/assets:{assets_directory}
      - .:/var/log:{log_directory}
    depends_on:
      - db
  db:
    image: "postgres"
    container_name: "db"
    ports:
      - "54333:5432"
    restart: always
    environment:
      POSTGRES_PASSWORD: {database_password}
      POSTGRES_USER: {database_user}
volumes:
  app:
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

export const runSh = `
#!/bin/sh

cd backend && docker compose up
npm run dev
`;

export const packageJson = `
{
  "name": "{project_name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "chmod +x run.sh && ./run.sh"
    "dev": "vite --mode development",
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
        "vite-plugin-lib-inject-css": "^2.1.1"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    }
}
`

export const viteConfig = `
import path, { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { libInjectCss } from 'vite-plugin-lib-inject-css'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        libInjectCss(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    resolve: {
        alias: {
            '@app': join(__dirname, 'src/app'),
            '@lib': join(__dirname, 'src/lib'),
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
`
