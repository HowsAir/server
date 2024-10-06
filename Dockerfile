# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia todo el repositorio
COPY . .

# Instala las dependencias y compila el backend
WORKDIR /usr/src/app/backend
RUN npm run build

# Cambia al directorio del frontend, instala dependencias y compila
WORKDIR /usr/src/app/frontend
RUN npm run build

# Establece el directorio de trabajo en el backend compilado
WORKDIR /usr/src/app/backend

# Expone el puerto en el que se ejecutará Express
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start"]