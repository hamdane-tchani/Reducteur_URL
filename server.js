import path from "node:path";
import process from "node:process"; // Acceder a des variables comme le numeero de version dans package.json
import { fileURLToPath } from "node:url";

import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert"; //Pour l'affichage des fichiers statiques
import laabr from "laabr";

import "dotenv/config"; //Vérifie que tu charges bien le fichier .env

import * as Database from "./db/index.js";

import homeRouter from "./routes/home.js";
import linksRouter from "./routes/links.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* process est un objet intégré dans Node.js. Il représente le processus en cours (= ton application qui tourne)
  process.env permet d'accéder aux variables d’environnement.*/ 


  /* 
  Pourquoi le fichier .env ? */

const server = Hapi.server({  
port: process.env.PORT, // utilise la valeur de la variable d’environnement PORT définie dans mon fichier .env
host: process.env.HOST, 

  router: { stripTrailingSlash: true },
  routes: {
    cors: {
      origin: ["*"],
    },
    files: {
      relativeTo: path.join(__dirname, "public"),
    },
  },
});

/**
 * register db functions globally
 *
 * @type {import("db/index.js")}
 */
server.app.db = Database;
server.app.db.initializeDatabase();

/*
   registers plugins in order:
    - laabr : logging with pino
    - inert : static files
  
*/
await server.register([
  {
    plugin: laabr,
    options: {
      formats: { onPostStart: "server.info", log: "log.tiny" },
      indent: 2,
      colored: true,
      pino: { level: process.env.NODE_ENV === "development" ? "debug" : "warn" },
    },
  },
  { plugin: Inert },
]);

// pour le service de fichiers statiques : on essaie de le servir
// et retourne une 404 via le handler par défaut sinon
server.route({
  method: "GET",
  path: "/{param*}",
  handler: {
    directory: {
      path: ".",
      redirectToSlash: true,
      index: true,
    },
  },
});

// routes métier
await server.register({ plugin: homeRouter });
await server.register({ plugin: linksRouter, routes: { prefix: "/api" } });

// graceful shutdown
const signals = ["SIGINT", "SIGTERM", "SIGQUIT", "SIGABRT", "SIGHUP"];
for (const signal of signals) {
  process.once(signal, async (signal) => {
    await server.app.db.end();
    await server.stop();
    process.exitCode = 0;
    server.log("warn", `server closed by ${signal}`);
  });
}

// light load for testing
export async function init() {
  await server.initialize();
  return server;
}

// full load
export async function start() {
  await server.start();
  server.log("info", server.info);
}
