import { Router } from "express";
import { buildOpenApiDocument } from "./openapi.js";

// Swagger UI from a CDN with a pinned version: nothing to bundle, so it also works as a serverless function.
const SWAGGER_UI = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.0";

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Portfolio API docs</title>
  <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
  <script src="/docs/init.js"></script>
</body>
</html>`;

// Kept out of the page so the Content-Security-Policy needs no inline scripts.
const init = `SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui", deepLinking: true });`;

// GET /openapi.json : the OpenAPI 3.1 document.  GET /docs : the same, as interactive Swagger UI.
export function docsRoutes() {
  const document = buildOpenApiDocument();
  const router = Router();

  router.get("/openapi.json", (_req, res) => {
    res.json(document);
  });

  router.get("/docs", (_req, res) => {
    // Helmet's default policy allows only same-origin scripts; the docs page also loads Swagger UI.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://cdn.jsdelivr.net",
    );
    res.type("html").send(page);
  });

  router.get("/docs/init.js", (_req, res) => {
    res.type("js").send(init);
  });

  return router;
}
