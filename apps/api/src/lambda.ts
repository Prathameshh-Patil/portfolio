import serverless from "serverless-http";
import { app } from "./configured-app.js";

// AWS Lambda entry point (see deploy/aws/). API Gateway sends every request here and serverless-http
// turns the event into a normal Express request, so the app runs unchanged.
export const handler = serverless(app);
