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
      context: .
      dockerfile: ./Dockerfile
    env_file: ./.env
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
#    build:
#      dockerfile: ./pgx_ulid/Dockerfile
    container_name: "db"
    ports:
      - "54333:5432"
    restart: always
    environment:
      POSTGRES_PASSWORD: {database_password}
      POSTGRES_USER: {database_user}
#    volumes:
#      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
volumes:
  app:
`

