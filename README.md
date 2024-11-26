# HowsAir Server

## Description

**HowsAir** is an application for managing and visualizing environmental measurement data. The backend is built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL** (via **Prisma** ORM), and **Vitest** for testing.

## Environment Variable Configuration

Set up the `.env` file in the root of the backend directory with the same environment variables as `.env.example`, adjusting values according to your environment:

- For **development** environments, ensure `NODE_ENV` is set to `development`.
- For **production** environments, update `NODE_ENV` to `production`.

## Part 1: Development

### Local Ready Environment

   Run the following command to start everything you will need:

   ```bash
   npm run setup
   ```

   This will install dependencies, create your .env file for you, create a Docker container with PostgreSQL configured according to the `.env` settings. Finally, it will also seed your database and run Prisma Studio so that you can interact visually with the Database.

   The backend server will start in development mode at `http://localhost:3000`.

## Part 2: Running Tests

### Running Tests with Vitest

To ensure your application is working as expected, you can run tests using **Vitest**. Follow these steps:

1. **Run Tests**:

   In the backend directory, execute the following command:

   ```bash
   npm run test
   ```

   This command will run all the test files in the project. By default, Vitest looks for files with the `.test.ts` or `.spec.ts` extension.

2. **Run Tests in Watch Mode**:

   If you want to continuously run your tests and re-run them whenever you make changes, use:

   ```bash
   npm run test:watch
   ```

3. **Viewing Test Results**:

   After running the tests, Vitest will display the results in the terminal. You will see which tests passed, which failed, and any error messages for the failing tests.

4. **Debugging Tests**:

   If a test fails, you can run Vitest in debug mode to get more insights:

   ```bash
   npx vitest --debug
   ```

   This will provide more detailed output about the test execution, helping you identify the root cause of any failures.

## Part 3: Production

In the **production** environment, Docker is recommended to encapsulate both the backend and database in separate containers.

1. **Build and Start Production Containers**:

   Execute the following commands to build and start containers:

   ```bash
   docker-compose build
   docker-compose --profile production up
   ```

   This setup will:

   - Start a container for the backend to serve API requests.
   - Run a separate PostgreSQL container for the database.

2. **HTTPS Configuration for Production**:

   To use HTTPS in production, generate a self-signed certificate. 

   Open **Git Bash** and run the following command inside the `backend` folder to generate the certificate files:

   ```bash
   openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
   ```

   This creates a `server.key` and `server.cert` file, which can then be used to set up HTTPS for secure production deployment.

3. **Compile and Deploy the Frontend in Production**:

   In production, it is recommended to compile the frontend and serve it as static files from the `dist/frontend` directory. 

   In the frontend directory, run:

   ```bash
   npm run build
   ```

   This will generate a `dist` folder with all frontend assets. These can be added to your Docker image or served from an NGINX server or similar, pointing to the `dist/frontend` directory.

4. **Access the Application**:

   Once the containers are running, access the API by visiting `http://localhost:3000`.

## Database Management with Prisma

To manage and interact with the database, **Prisma** offers a set of commands that are useful for handling migrations and generating the Prisma Client.

### Prisma Workflow

1. **Applying Migrations in Production**:

   When deploying to production or any other environment, use the following command to apply any pending migrations to the database:

   ```bash
   npx prisma migrate deploy
   ```

   This command applies all migrations created in development, ensuring your production database schema is up to date.

2. **Generate Additional Migrations in Development**:

   To generate a new migration after schema changes, use:

   ```bash
   npx prisma migrate dev --name add_new_field
   ```

3. **Generate Prisma Client**:

   After any schema updates, regenerate the Prisma Client to reflect the latest schema:

   ```bash
   npx prisma generate
   ```

4. **View the Database**:

   You can view and interact with the database using Prisma Studio:

   ```bash
   npx prisma studio
   ```

## Code Quality Assessment with SonarQube

To analyze and maintain code quality, use **SonarQube**. Follow these steps to set it up locally:

1. **Run SonarQube in Docker**:

   Start a SonarQube instance with Docker:

   ```bash
   docker run --name sonarqube -p 9000:9000 -p 9092:9092 -v sonarqube-conf:/opt/sonarqube/conf -v sonarqube-data:/opt/sonarqube/data -v sonarqube-logs:/opt/sonarqube/logs -v sonarqube-extensions:/opt/sonarqube/extensions sonarqube:lts
   ```

   Open [http://localhost:9000](http://localhost:9000) in your browser and log in with the default credentials `admin/admin`.

2. **Create a New Project and Generate a Token**:

   Within SonarQube, create a new project and generate an authentication token for it.

3. **Install and Run Sonar Scanner**:

   Install **Sonar Scanner** on your machine and run it in the project’s root directory:

   ```bash
   sonar-scanner -D"sonar.projectKey=HowsAir" -D"sonar.sources=." -D"sonar.host.url=http://localhost:9000" -D"sonar.login=your_generated_token"
   ```

   > **Note:** If you encounter issues, edit the `sonar.properties` file in the SonarQube `conf` directory to set the following:

   ```plaintext
   sonar.host.url=http://localhost:9000
   sonar.web.port=9000
   ```

## Common Troubleshooting

### Related to Docker and Credentials

If you are using Docker on **Windows**, you may encounter an error related to credentials, such as:

```plaintext
error during connect: Post http://docker/credentials:
error while looking up credential store docker-credential-wincred.exe
```

To resolve this, follow these steps:

1. **Edit the Docker Configuration File**:

   Open the file `~/.docker/config.json` in a text editor.

2. **Change `credsStore` to `credStore`**:

   Inside the file, find the line containing `credsStore` and change it to `credStore`. The file should look something like this:

   ```json
   {
     "auths": {
       "https://index.docker.io/v1/": {}
     },
     "credStore": "wincred"
   }
   ```

3. **Save the Changes and Restart Docker**

4. **Another Solution: Delete the `config.json` File**:

   If the previous step does not resolve the issue, you can try completely deleting the `config.json` file located at `~/.docker/config.json.` Docker will generate a new one automatically the next time it runs.

> If you continue to encounter problems, ensure that Docker is updated to the latest version and that the credentials are configured correctly.

### Related to Server Communication from Another Device

If Docker Desktop is running on **Windows** and you cannot connect to the server

 from another device on the same network, such as an Android device handling Beacon data, you can follow these steps to troubleshoot the issue:

1. **Uninstall WSL**: Uninstall WSL to remove any problematic configuration.

2. **Uninstall Docker**: Uninstall Docker Desktop to ensure a clean installation.

3. **Reinstall WSL and Ubuntu**: Reinstall WSL and the Ubuntu distribution to start fresh.

4. **Reinstall Docker**: Reinstall Docker Desktop, following all recommended installation steps.

5. **Create a `.wslconfig` File**: In the user folder, create a file named `.wslconfig` with the following content:

   ```ini
   [wsl2]
   swap=0
   ```

6. **Configure the Firewall**: Create a rule in the Windows Firewall to allow incoming traffic on all networks for port 3000.

## Other Related Repositories

This project is part of a larger ecosystem that includes:

- **HowsAir for Android**: The mobile client for managing and visualizing environmental measurements, developed for Android. You can find the repository [here](https://github.com/HowsAir/android).

- **HowsAir for Arduino**: The firmware for the Arduino devices that capture environmental measurements. You can find the repository [here](https://github.com/HowsAir/arduino).

- **HowsAir's Frontend**: The frontend client for this backend that shows you intuitively the measures taken. You can find the repository [here](https://github.com/HowsAir/frontend).
