# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia todo el repositorio
COPY . .

# Instala las dependencias y compila el server
WORKDIR /usr/src/app/server
RUN npm run build

# Establece el directorio de trabajo en el server compilado
WORKDIR /usr/src/app/server

# Expone el puerto en el que se ejecutará Express
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start"]