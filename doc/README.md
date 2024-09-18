# Documentación del Backend

## Estructura del Proyecto

### **Patrón de Arquitectura**

Hemos seguido una estructura basada en el patrón de arquitectura **MVC (Modelo-Vista-Controlador)**, adaptado para una aplicación backend con una separación clara de responsabilidades:

- **Modelo (Models)**: Define la estructura de los datos y las interacciones con la base de datos. En nuestro caso, los modelos están definidos utilizando Mongoose y representan las colecciones de MongoDB.

- **Controlador (Controllers)**: Contiene la lógica de negocio para manejar las solicitudes HTTP y coordinar las respuestas. Los controladores utilizan los servicios para interactuar con los modelos y gestionar la lógica de la aplicación.

- **Servicios (Services)**: Encapsulan la lógica de negocio específica, separando la lógica de acceso a datos y la lógica de aplicación. Los servicios se encargan de realizar operaciones sobre los datos y son utilizados por los controladores.

- **Rutas (Routes)**: Definen las rutas de la API y los endpoints disponibles. Las rutas están configuradas para manejar las solicitudes y delegar las operaciones a los controladores correspondientes.

## Consideraciones Adicionales

Este enfoque modular y basado en el patrón MVC facilita el mantenimiento y la escalabilidad del proyecto, asegurando una estructura clara y una separación adecuada de las responsabilidades.