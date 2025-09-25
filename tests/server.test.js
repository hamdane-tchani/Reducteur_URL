/* eslint-disable no-unused-vars */
import process from "node:process";
import Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { init } from "../server.js";

export const lab = Lab.script();
const { after, before, describe, it } = lab;

function checkLinkObject(payload) {
  for (const key of ["long", "short", "visits", "last_visited_at"]) {
    expect(payload).to.include(key);
  }
}

describe("Server", () => {
  let server;

  before(async () => {
    server = await init();
  });

  after(async () => {
    await server.stop();
  });

  describe("Home router", () => {
    it("GET / is 200", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/",
      });
      expect(response.headers).to.include("content-type");
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.statusCode).to.equal(200);
    });

    it("GET /favicon.svg is 200", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/favicon.svg",
      });
      expect(response.headers).to.include("content-type");
      expect(response.headers["content-type"]).to.include("image/svg+xml");
      expect(response.statusCode).to.equal(200);
    });

    it("GET /health is 200", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/health",
      });
      expect(response.headers).to.include("content-type");
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.statusCode).to.equal(200);
      const payload = JSON.parse(response.payload);
      for (const [key, value] of [
        ["sqliteVersion"],
        ["hapiVersion"],
        ["name", process.env.npm_package_name],
        ["version", process.env.npm_package_version],
        // the following are not defined by npm, but are by pnpm.
        // ["homepage", process.env.npm_package_homepage],
        // ["description", process.env.npm_package_description],
      ]) {
        expect(payload).to.include(key);
        if (value !== undefined) {
          expect(payload[key]).to.equal(value);
        }
      }
    });

    it("GET /health/ is 200", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/health/",
      });
      expect(response.statusCode).to.equal(200);
    });
  });

  describe("Links router", () => {
    it("GET /api is 200", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api",
      });
      expect(response.headers).to.include("content-type");
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.statusCode).to.equal(200);
      const { links_count } = JSON.parse(response.payload);
      expect(links_count).to.be.a.number();
    });

    it("GET /api/{short} is 404", async () => {
      const response = await server.inject({
        method: "GET",
        url: `/api/FuCkThIs`,
      });
      expect(response.statusCode).to.equal(404);
    });

    describe("Create/Read/Status/Delete", () => {
      // scenario
      let link;

      it("POST /api is 201", async () => {
        const response = await server.inject({
          method: "POST",
          url: "/api",
          payload: { uri: "https://perdu.com" },
        });
        expect(response.headers).to.include("content-type");
        expect(response.headers["content-type"]).to.include("application/json");
        expect(response.statusCode).to.equal(201);
        const payload = JSON.parse(response.payload);
        // checkLinkObject(payload);
        expect(payload.long).to.equal("https://perdu.com");
        expect(payload.visits).to.equal(0);
        link = payload;
      });

      it("GET /api/{short} is 302", async () => {
        const response = await server.inject({
          method: "GET",
          url: `/api/${link.short}`,
        });
        expect(response.headers).to.include("location");
        expect(response.headers.location).to.equal("https://perdu.com");
        expect(response.statusCode).to.equal(302);
      });
    });
  });
});
