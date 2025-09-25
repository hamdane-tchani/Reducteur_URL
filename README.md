# LIFWEB URL Shortener

Dépôt du projet de départ de réducteur d'URL <https://forge.univ-lyon1.fr/aurelien.tabard/lifweb-url-shortener-2025>, voir [le sujet](http://lifweb.pages.univ-lyon1.fr/TP5a/).

⚠️ Il faut **_forker_ ce projet** dans votre compte <https://forge.univ-lyon1.fr/> en gardant **le même nom** `lifweb-url-shortener-2025`. ⚠️

⚠️ Votre _fork_ devra être **privé**. Donnez des droits d'accès `reporter` à `aurelien.tabard` **et** à votre chargé de TP. ⚠️


## Introduction

On fournit un serveur de départ réalisé en <https://hapi.dev/> avec les modules suivants :

- <https://hapi.dev/api/> (framework web)
- <https://hapi.dev/module/boom/api/> (erreurs HTTP)
- <https://hapi.dev/module/inert/api/> (fichiers statiques)
- <https://joi.dev/api/> (validation)
- <https://github.com/felixheck/laabr> (logging)
- <https://github.com/WiseLibs/better-sqlite3> (Base de données sqlite pour node)
- <https://github.com/motdotla/dotenv> (environnement)

Le projet de départ implémente une partie de routes.
Celles qui ne sont **pas** implémentées renvoient pour l'instant une [501 Not Implemented](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501).

Une démonstration _complète_ du projet est proposée sur <https://api.lifweb.os.univ-lyon1.fr>.

## Installation

Vous pouvez utiliser <https://pnpm.io/> au lieu de <https://www.npmjs.com/>.

1. Copier le fichier `.env.sample` en `.env`.
2. Installer les dépendances avec `npm install`.
3. Exécuter `npm start` pour le développement et `npm run prod` pour la production.
4. Exécuter `npm test` pour exécuter les tests d'intégration.

Pour les tests manuels utiliser <https://httpie.io/>, e.g., `http :3000/health`.

### Base de données SQLite 💣

Ce projet embarque une base de données SQLite, qui sera créée si elle n'existe avec la table `links` de `db/links.sql`.

La base sera créée et persistera sous le nom `database.sqlite` dans votre projet.

## Environnement de développement

Il est recommandé d'être sous Linux.

En cas de machine personnelle sous Windows, nous recommandons d'utiliser [WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

Pour avoir un environnement semblable à celui qu'on utilisera sur la machine virtuelle de déploiement en fin de TP, installer _une version récente_ de Node.js en utilisant [le dépôt nodesource](https://github.com/nodesource/distributions) ou [NVM](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl).
