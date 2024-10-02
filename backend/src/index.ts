/**
 * @file index.ts
 * @brief Punto de entrada principal de la aplicación que inicia el servidor Express
 * @author Juan Diaz
 * @date 20/09/2024
 */

import app from "./app";

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
