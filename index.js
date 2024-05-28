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
 * - package.json data
 */