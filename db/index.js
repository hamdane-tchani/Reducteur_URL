import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import { readFileSync } from "fs";

// Ouvre la base de données (persiste sur le disque)
const db = new Database("database.sqlite"); //C’est l’objet qui représente ta connexion à la base SQLite.

// Initialise la base de données avec le schéma SQL
export function initializeDatabase() {
  const schema = readFileSync("db/links.sql", "utf-8");
  db.exec(schema); // Exécute le SQL pour créer les tables si nécessaire
  console.log("Base de données initialisée.");
}

/**
 * Retourne des informations sur la base de données SQLite
 */
export function getServerStats() {
  const sqliteVersion = db
    .pragma("compile_options")
    .find((opt) => opt.compile_options.startsWith("COMPILER="));
  const pageSize = db.pragma("page_size")[0].page_size;
  const journalMode = db.pragma("journal_mode")[0].journal_mode;
  const foreignKeysEnabled = db.pragma("foreign_keys")[0].foreign_keys;

  return {
    sqliteVersion: sqliteVersion || "Unknown",
    databaseFile: db.name, // Nom du fichier de la base de données
    currentTimestamp: new Date().toISOString(), // Timestamp actuel
    pageSize: pageSize, // Taille des pages en bytes
    journalMode: journalMode, // Mode de journalisation (WAL, DELETE, etc.)
    foreignKeysEnabled: !!foreignKeysEnabled, // Vérifie si les clés étrangères sont activées
  };
}

/**
 * Retourne des statistiques sur les liens
 */
export function getAllLinksStats() {
  return db.prepare("SELECT COUNT(*) as links_count FROM links").get();
}

/**
 * Récupère un lien à partir de son URL courte
 */
export function getLinkByShort(short) {
  return db.prepare("SELECT * FROM links WHERE short = ?").get(short);
}

/**
 * Crée un lien court à partir d'une URL longue
 */
export function createLink(uri) {
  const short = nanoid(8);
  db.prepare("INSERT INTO links (short, long) VALUES (?, ?)").run(short, uri);
  return { short, long: uri };
} 

/**
 *
 * Correction TP5a exo 2
 *
 * Met à jour le nombre de visites et le timestamp du dernier accès
 */
export function updateVisit(short) {
  db
    .prepare(
      "UPDATE links SET visits = visits + 1, created_at = datetime('now', 'utc') WHERE short = ?",
    )
    .run(short);
} 

export function deleteLinkByShort(short) {
  return db.prepare("DELETE FROM links WHERE short = ?").run(short);
}


/**
 * Ferme la connexion à la base de données proprement (optionnel)
 */
export function end() {
  db.close();
  console.log("Base de données fermée.");
}
