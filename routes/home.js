import process from "node:process";

export default { 
  name: "home",
  version: process.env.npm_package_version,
  register: function (server, _options) {
    server.route({
      method: "GET",
      path: "/",
      handler: (request, h) => ({
        message: `Welcome to ${process.env.npm_package_name} v${process.env.npm_package_version}`,
        routes: server.table().map((r) => ({ method: r.method.toUpperCase(), path: r.path })),
      }),
    });

    server.route({ 
      method: "GET",
      path: "/health",
      handler: async (request, h) => {
        const baseInfos = {
          serverUri: server.info.uri,
          hapiVersion: server.version,
          name: process.env.npm_package_name,
          version: process.env.npm_package_version,
        };
        try {
          const databaseInfo = await server.app.db.getServerStats();
          return {
            ...databaseInfo,
            ...baseInfos,
          };
        } catch (error) {
          server.log("error", error.message);
          return {
            DBinfo: false,
            ...baseInfos,
          };
        }
      },
      options: {
        description: "Healthcheck",
        notes: "Check if database is OK and returns current timestamp",
        tags: ["api"],
      },
    });
  },
};
