// Vercel entry point. Vercel turns each file in api/ into a serverless function; an Express app is a
// (req, res) handler, so it can be exported as is. vercel.json sends every path here.
export { app as default } from "../src/configured-app.js";
