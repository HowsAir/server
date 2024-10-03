# freshair-server

## Descripción

**FreshAir** es una aplicación para gestionar y visualizar datos de mediciones ambientales. El proyecto cuenta con un backend desarrollado con **Node.js**, **Express**, **Typescript**, **MongoDB** y **Vitest**, y un frontend construido con **React**, **Vite**, **Typescript**, y **Tailwind CSS**.

## Configuración de Variables de Entorno

Asegúrate de crear los archivos `.env` en las carpetas `backend` y `frontend` con las siguientes variables:

### Backend (`backend/.env`)

```plaintext
MONGODB_URI=mongodb://localhost:27017/your_database_name
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> Si deseas usar una base de datos MongoDB en la nube, puedes reemplazar `MONGODB_URI` con la URL de tu propio clúster en MongoDB Atlas u otra solución en la nube.

### Frontend (`frontend/.env`)

```plaintext
API_BASE_URL="http://localhost:3000"
```

## Parte 1: Desarrollo

En el entorno de **desarrollo**, puedes trabajar tanto con tu propia base de datos en la nube como con una base de datos local usando Docker.

### Opción 1: Desarrollo con MongoDB Local en contenedor usando Docker

1. **Levantar la base de datos local con Docker**:

   Ejecuta los siguientes comandos para levantar una instancia local de MongoDB en Docker:

   ```bash
   docker-compose build
   docker-compose --profile default up
   ```

   Esto creará un contenedor de Docker con una base de datos MongoDB local. Si quieres configurar un nombre de base de datos personalizado, entra en el docker-compose.yml y cambia "your_database_name" por el nombre que quieras:

   ```plaintext
   MONGODB_URI=mongodb://localhost:27017/your_database_name
   ```

2. **Instalar Dependencias y Ejecutar el Backend**:

   Ve a la carpeta del backend y ejecuta los siguientes comandos:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   Esto levantará el servidor backend en modo de desarrollo en `http://localhost:3000`.

3. **Instalar Dependencias y Ejecutar el Frontend**:

   Ve a la carpeta del frontend y ejecuta:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   El frontend estará disponible en `http://localhost:5173`.
   Accede a la url para interactuar con la app.

### Opción 2: Desarrollo con MongoDB en la Nube

Si prefieres no usar Docker para la base de datos, puedes conectarte directamente a un clúster de MongoDB en la nube, como MongoDB Atlas.

1. **Configura el archivo `.env` del backend**:

   Cambia la variable `MONGODB_URI` en el archivo `.env` del backend para que apunte a tu clúster en la nube:

   ```plaintext
   MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority
   ```

2. **Instalar dependencias y ejecutar**:

   Sigue los mismos pasos que en **Opción 1.2** y **Opción 1.3** para instalar las dependencias y levantar tanto el backend como el frontend.

## Parte 2: Producción

En el entorno de **producción**, Docker es la opción recomendada para ejecutar tanto el backend como la base de datos MongoDB en contenedores separados. Todo estará encapsulado y configurado para un despliegue sencillo.

### Producción con Docker

1. **Compilar los contenedores para producción**:

   Ejecuta los siguientes comandos desde la raíz del proyecto:

   ```bash
   docker-compose build
   ```

2. **Levantar los contenedores en modo producción**:

   Ejecuta este comando para levantar el backend y la base de datos MongoDB en contenedores:

   ```bash
   docker-compose --profile production up
   ```

   Esto hará lo siguiente:

   - Levantará un contenedor para el backend, que servirá tanto la API como los archivos estáticos del frontend.
   - Levantará un contenedor separado para MongoDB.

3. **Configuración automática de variables de entorno**:

   No necesitas modificar los archivos `.env` manualmente para producción, ya que `docker-compose.yml` se encargará de configurar las variables de entorno apropiadas en cada contenedor.

4. **Acceder a la aplicación**:

   Una vez que los contenedores estén en funcionamiento, puedes acceder a la aplicación a través de tu navegador. El backend de Express servirá los archivos estáticos del frontend, por lo que solo necesitarás visitar la URL correspondiente:

   - Si estás ejecutando la aplicación localmente, visita: `http://localhost:3000`
   - Este es el punto de entrada tanto para la API como para la aplicación web. El frontend ya está compilado y se servirá desde el mismo servidor Express que maneja la API.
   - La base de datos MongoDB estará ejecutándose en un contenedor separado y conectada al backend automáticamente a través de la URL configurada.

Aquí tienes la versión actualizada con la solución alternativa de borrar el archivo `config.json`:

### Solución de Problemas Comunes en Docker

Si estás utilizando Docker en **Windows**, es posible que encuentres un error relacionado con las credenciales, como:

```plaintext
error during connect: Post http://docker/credentials:
error while looking up credential store docker-credential-wincred.exe
```

Para solucionarlo, sigue estos pasos:

1. **Editar el archivo de configuración de Docker**:

   Abre el archivo `~/.docker/config.json` en un editor de texto.

2. **Cambiar `credsStore` a `credStore`**:

   Dentro del archivo, busca la línea que contiene `"credsStore"` y cámbiala por `"credStore"`. El archivo debería verse algo así:

   ```json
   {
     "auths": {
       "https://index.docker.io/v1/": {}
     },
     "credStore": "wincred"
   }
   ```

3. **Guarda los cambios y reinicia Docker**

4. **Otra Solución: Eliminar el archivo `config.json`**:

   Si el paso anterior no soluciona el problema, puedes intentar eliminar completamente el archivo `config.json` que se encuentra en `~/.docker/config.json`. Docker generará uno nuevo automáticamente la próxima vez que se ejecute.

> Si sigues encontrando problemas, asegúrate de que Docker esté actualizado a su última versión y que las credenciales estén correctamente configuradas.
```
