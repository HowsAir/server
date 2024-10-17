/**
 * @file index.ts
 * @brief Main file for the API, starts the server
 * @author Juan Diaz
 */

import app from "./app";

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port: ${PORT}`);
});
