import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

console.log("TURSO_DATABASE_URL = ", process.env.TURSO_DATABASE_URL);
