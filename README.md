# HowsAir-server

## Description

**HowsAir** is an application for managing and visualizing environmental measurement data. The project features a backend developed with **Node.js**, **Express**, **Typescript**, **MongoDB** and **Vitest**, and a frontend built with **React**, **Vite**, **Typescript**, and **Tailwind CSS**.

## Environment Variable Configuration

Make sure to create the `.env` files in both the `backend` and `frontend` folders with the following variables, adjusting the values according to the environment you are working in.

### Backend (`backend/.env`)

```plaintext
MONGODB_URI=mongodb://localhost:27017/your_database_name
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> In **development**, ensure that `NODE_ENV` is set to `development`.  
> In **production**, change `NODE_ENV` to `production`.

> If you wish to use a MongoDB database in the cloud, you can replace `MONGODB_URI` with the URL of your own cluster in MongoDB Atlas or another cloud solution.

### Frontend (`frontend/.env`)

```plaintext
VITE_NODE_ENV=development
```

> In **development**, `VITE_NODE_ENV` has to be set to `development`.  
> In **production**, change `VITE_NODE_ENV` to `production`.

## Part 1: Development

In the **development** environment, you can work with either your own cloud database or a local database using Docker.

### Option 1: Development with Local MongoDB in a Docker Container

1. **Start the local database with Docker:**:

   Run the following commands to start a local instance of MongoDB in Docker:

   ```bash
   docker-compose build
   docker-compose --profile default up
   ```

   This will create a Docker container with a local MongoDB database. If you want to set a custom database name, go to your .env file and change "your_database_name" to the name you want:

   ```plaintext
   MONGODB_URI=mongodb://localhost:27017/your_database_name
   ```

2. **Install Dependencies and Run the Backend:**:

   Navigate to the backend folder and run the following commands:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   This will start the backend server in development mode at `http://localhost:3000`.

3. **Install Dependencies and Run the Frontend:**:

   Navigate to the frontend folder and execute:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.
   Access the URL to interact with the app.

### Option 2: Development with MongoDB in the Cloud

If you prefer not to use Docker for the database, you can connect directly to a MongoDB cluster in the cloud, such as MongoDB Atlas.

1. **Configure the Backend `.env` File**:

   Change the `MONGODB_URI` variable in the backend `.env` file to point to your cloud cluster:

   ```plaintext
   MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority
   ```

2. **Install Dependencies and Run:**:

   Follow the same steps as in **Option 1.2** and Option **1.3** to install the dependencies and start both the backend and frontend.

## Parte 2: Production

In the **production** environment, Docker is the recommended option for running both the backend and the MongoDB database in separate containers. Everything will be encapsulated and configured for a simple deployment.

### Production with Docker

1. **Start the Containers in Production Mode**:

   Execute this command to start the backend and MongoDB database in containers:

   ```bash
   docker-compose build
   ```

2. **Levantar los contenedores en modo producción**:

   Ejecuta este comando para levantar el backend y la base de datos MongoDB en contenedores:

   ```bash
   docker-compose --profile production up
   ```

   This will do the following:

   - Start a container for the backend, which will serve both the API and the static files from the frontend.
   - Start a separate container for MongoDB.

3. **Access the Application**:

   Once the containers are up and running, you can access the application through your browser.

   - If you are running the application locally, visit: `http://localhost:3000`
   - This is the entry point for both the API and the web application. The frontend is already compiled and will be served from the same Express server that handles the API.
   - The MongoDB database will be running in a separate container and connected to the backend automatically through the configured URL.

## How to Run Tests

The project includes tests for both the backend and the frontend, using **Vitest**. To run them, follow these steps:

1. **Backend**:

   Go to the `backend` folder and execute:

   ```bash
   cd backend
   npm test
   ```

2. **Frontend**:

   Go to the `frontend` folder and execute:

   ```bash
   cd frontend
   npm test
   ```

   This will run the tests in each part of the project and allow you to verify that the code is working correctly.

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

4. **Another Solution: Delete the `config.json` File:**:

   If the previous step does not resolve the issue, you can try completely deleting the `config.json` file located at `~/.docker/config.json.` Docker will generate a new one automatically the next time it runs.

> If you continue to encounter problems, ensure that Docker is updated to the latest version and that the credentials are configured correctly.

### Related to Server Communication from Another Device

If Docker Desktop is running on **Windows** and you cannot connect to the server from another device on the same network, such as an Android device handling Beacon data, you can follow these steps to troubleshoot the issue:

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

- **HowsAir's Frontend**: The frontend client for this backend that shows you intuitively the measures taken. You can find the repository [here](https://github.com/HowsAir/arduino).


