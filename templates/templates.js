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
.git
.svn
.hg
node_modules
.next
yarn.lock
public
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
