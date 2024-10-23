/**
 * @file index.ts
 * @brief Main file for the API, starts the server
 * @author Juan Diaz
 */

import app from "./app";
import "dotenv/config";
import path from "path";
import https from 'https';
import fs from 'fs';

const PORT = 3000;
const IP = "0.0.0.0"

if (process.env.NODE_ENV != "development") {
  const options = {
    key: fs.readFileSync(path.join(__dirname, '../server.key')),
    cert: fs.readFileSync(path.join(__dirname, '../server.cert')),
  };

  https.createServer(options, app).listen(PORT, IP,() => {
    console.log(`HTTPS Server running on port: ${PORT}`);
  });
}
else {
  app.listen(PORT, IP, () => {
    console.log(`Server running on port: ${PORT}`);
  });
}