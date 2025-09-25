import process from "node:process"; // pour accéder à des variables comme le numéro de version dans package.json.
import Joi from "joi"; //pour valider les données envoyées (ex: vérifier qu’un champ est bien une URL).
import Boom from "@hapi/boom"; //pour envoyer des erreurs HTTP propres (comme 404, 400, etc.)

export default { //Je suis un plugin Hapi qui gère les liens. Voici mes routes.”
  name: "links",
  version: process.env.npm_package_version,
  register: async function linksHandler(server, _options) {
    const { db } = server.app;
    const { prefix } = server.realm.modifiers.route;

    server.route({ //🔍 Renvoie la liste de tous les liens raccourcis (utile pour la page d’accueil ou les stats).
      method: "GET",
      path: "/",
      handler: async (request, h) => {
        return await db.getAllLinksStats();
      },
    });

     server.route({ 
      method: "GET", // Cette route va répondre à une requête GET (lecture seulement)
      path: "/{short}", // L’utilisateur va taper une URL comme http://localhost:3000/api/abc123/status, et le mot abc123 va être capturé dans la variable short.
      handler: async (request, h) => { 
        const { short } = request.params;//On extrait le mot short (comme abc123) à partir de l’URL demandée.
        const link = await server.app.db.getLinkByShort(short); //On va chercher dans la base de données si ce raccourci existe déjà.
        if (link === undefined) { 
          throw Boom.notFound(`Shortened link ${short} not found`); // Si le lien n’est pas trouvé, on renvoie une erreur 404
        }

        // -- Correction TP5a, exo 2.1:
        server.app.db.updateVisit(short);  //modele
        // --
        server.log("debug", `Redirecting to ${link.long}`); // On affiche un message dans la console (à but de debug), pour dire vers quelle URL on veut etre rediriger.
        return h.redirect(link.long); 
      },
    }); 

    server.route({
      method: "GET",
      path: "/{short}/status",
      handler: async (request, h) => {
        const { short } = request.params;
        const link = await server.app.db.getLinkByShort(short); 
        if (link === undefined) {
          throw Boom.notFound(`Shortened link ${short} not found`);
        }
        delete link.secret_key; // très important : on ne retourne pas la clé secrète
        return { link }; // ✅ retourne les infos en JSON
      },
    });
    

  // Le code HTTP 302 signifie found: la ressource demandée (le lien court) redirige vers une autre URL

    /* server.route({
      method: "GET",
      path: "/{short}/status",
      handler: async (request, h) => {
        throw Boom.notImplemented("Not implemented");
      },
    });  */


    server.route({ 
      method: "DELETE", //On crée une route HTTP DELETE, à l'adresse /api/abc123 (si short = abc123)
      path: "/{short}",
      handler: async (request, h) => { //Fonction exécutée quand l’utilisateur demande à supprimer un lien.
        // Correction TP5a exo 3 
        // Supprime un lien 
        const { short } = request.params;
        const { secret_key } = request.payload;
        server.log("info", short + " " + secret_key); //→ Juste pour vérifier dans le terminal ce qu'on reçoit (utile en développement)

        const link = await server.app.db.getLinkByShort(short);
        if (link === undefined) {
          // 404 si le lien n’existe pas
          throw Boom.notFound(`Shortened link ${short} not found`);
        }
        if (secret_key === undefined) {
          // 400 si pas de clé fournie
          throw Boom.badRequest("invalid query, missing key param");
        } 
        if (link.secret_key != secret_key) {
          // 401 mauvaise clé
          throw Boom.unauthorized(`Invalid key`);
        } 
        server.app.db.deleteLinkByShort(short);
        return { link }; // 200 → On renvoie les infos du lien supprimé (code 200 OK)
      },
      options: {
        validate: {
          payload: Joi.object({ 
            secret_key: Joi.string().length(12).example("y1otdDzBIVXR"),
          }),
        },
      },
    });


    server.route({
      method: "POST",
      path: "/",
      handler: async (request, h) => {
        const { uri } = request.payload; //nom du champ attendu pour l'url longue
        const link = await db.createLink(uri);
        return h.response({ ...link, uri: `${server.info.uri}${prefix}/${link.short}` }).code(201);
      },
      options: {
        validate: {
          payload: Joi.object({
            uri: Joi.string().uri().example("http://perdu.com"),
          }),
        },
      },
    });
  },
};
