# Proyecto FreshAir

## Descripción

FreshAir es una aplicación para gestionar y visualizar datos de mediciones ambientales. El proyecto está compuesto por un backend desarrollado con Node.js, Express y MongoDB, y un frontend construido con React, Vite y Tailwind CSS.

## Tecnologías Utilizadas

### Backend

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express.js**: Framework web para Node.js que facilita el desarrollo de APIs.
- **TypeScript**: Superset de JavaScript que añade tipado estático.
- **MongoDB**: Base de datos NoSQL para almacenar datos de mediciones.
- **Mongoose**: Biblioteca de modelado de datos de MongoDB para Node.js.
- **Vitest**: Herramienta de pruebas para asegurar la calidad del código.
- **Express Validator**: Middleware para validar y sanitizar datos de entrada.

### Frontend

- **React**: Biblioteca de JavaScript para construir interfaces de usuario.
- **Vite**: Herramienta de compilación rápida para proyectos React.
- **TypeScript**: Para asegurar tipado estático en el frontend.
- **Tailwind CSS**: Framework de CSS para un diseño rápido y eficiente.
- **HTML/CSS/JavaScript**: Tecnologías básicas para la estructura y el estilo de la aplicación.

## Estructura del Proyecto

El proyecto está organizado en dos carpetas principales: `backend` y `frontend`.

### Backend

- **`src/`**: Contiene el código fuente de la aplicación.
  - **`controllers/`**: Controladores para manejar la lógica de negocio y las solicitudes HTTP.
  - **`models/`**: Modelos de datos definidos con Mongoose.
  - **`routes/`**: Definiciones de rutas y endpoints de la API.
  - **`services/`**: Servicios que encapsulan la lógica de negocio.
  - **`utils/`**: Funciones y utilidades auxiliares.
  - **`index.ts`**: Archivo principal que inicia el servidor Express.
  - **`app.ts`**: Configuración del servidor y middlewares.
- **`dist/`**: Carpeta generada después de la compilación del código TypeScript.
- **`test/`**: Contiene pruebas unitarias y de integración.
- **`.env`**: Archivo de configuración para variables de entorno.
- **`package.json`**: Archivo de configuración de npm con scripts y dependencias.

### Frontend

- **`src/`**: Contiene el código fuente del frontend.
  - **`components/`**: Componentes React para la interfaz de usuario.
  - **`pages/`**: Páginas principales de la aplicación.
  - **`styles/`**: Archivos de estilo CSS y Tailwind.
  - **`index.html`**: Archivo HTML principal.
  - **`index.tsx`**: Punto de entrada para la aplicación React.
- **`dist/`**: Carpeta generada después de la compilación del frontend.
- **`.env`**: Archivo de configuración para variables de entorno del frontend.
- **`package.json`**: Archivo de configuración de npm con scripts y dependencias.

## Configuración

### Variables de Entorno

Asegúrate de crear archivos `.env` en las carpetas `backend` y `frontend` con las siguientes variables:

- **Backend (`backend/.env`)**

  ```plaintext
  MONGODB_URI=mongodb+srv://admin:mybkf541d1D2Ea2U@cluster0.8u2cs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  NODE_ENV=development
  PORT=5000
  FRONTEND_URL=http://localhost:5173
  ```

- **Frontend (`frontend/.env`)**
  ```plaintext
  API_BASE_URL="http://localhost:5000"
  ```

### Instalación y Ejecución

#### Backend

1. **Instalar Dependencias**

   ```bash
   cd backend
   npm install
   ```

2. **Ejecutar en Desarrollo**

   ```bash
   npm run dev
   ```

3. **Compilar para Producción**

   ```bash
   npm run build
   ```

4. **Ejecutar en Producción**

   ```bash
   npm start
   ```

5. **Ejecutar Pruebas**
   ```bash
   npm run test
   ```

#### Frontend

1. **Instalar Dependencias**

   ```bash
   cd frontend
   npm install
   ```

2. **Ejecutar en Desarrollo**

   ```bash
   npm run dev
   ```

3. **Compilar para Producción**
   ```bash
   npm run build
   ```

### Desarrollo

En el modo de desarrollo, el backend y el frontend se ejecutan en servidores separados. El backend estará en `http://localhost:5000` y el frontend en `http://localhost:5173` (puerto gestionado por Vite). Asegúrate de que ambos servidores estén funcionando para una integración completa.

Para producción, el frontend se compilará en archivos estáticos y se servirá a través del backend desde la carpeta `dist` del frontend, que será manejada por Express en el backend.

### Producción

En el entorno de producción, primero se compilan tanto el frontend como el backend:

1. **Compilar el Frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Compilar el Backend**

   ```bash
   cd backend
   npm run build
   ```

3. **Iniciar el Backend en Producción**
   ```bash
   cd backend
   npm start
   ```

Esto servirá la aplicación completa, con el backend manejando tanto la API como los archivos estáticos del frontend.

---

## ARREGLAR Y ADAPTAR

"docker-credential-wincred.exe", en ~/.docker/conf.json cambia credsStore a credStore

Nos bajamos el proyecto, si queremos hacer desarrollo, colocamos los
.env en frontend con la url del port que elegimos en el .env de backend y en backend escribimos el puerto, la url determinada del
frontend, y la url de nuestra base de datos que puede ser en local
que sera el contenedor que usaremos haciendo docker-compose luego
o una url a base de datos mongodb en cluster con tus credenciales

Luego hacemos npm install y npm run dev en frontend y backend ya deberia de estar si usas una url de mongodb en la nube.

Si quieres usar en development un contenedor local de Docker con tu DB, haras:
docker-compose build
docker-compose --profile default up
Ya tendrias tu base de datos en local solo tendras que poner una
url como esta en .env: MONGODB_URI=mongodb://localhost:27017/your_database_name

Si quieres en lugar de esto puedes simplemente clonar el repositorio
y hacer:
docker-compose build
docker-compose --profile production up

No te preocupes de cambiar los .env cuando haces estos comandos
ya el docker-compose.yml configura las variables de entorno

Asi tendras ya el Backend y la DB en contenedores separados que se
comunican entre sí y podrás probarlo directamente sin complicaciones

Ten en cuenta que esto no es para development ya que aquí no
tendríamos las ventajas de hot reloading tanto de nodemon en el servidor
como de vite con react en el frontend. Este Backend en contenedor
ya esta compilado y el frontend es servido estáticamente ya compilado.
