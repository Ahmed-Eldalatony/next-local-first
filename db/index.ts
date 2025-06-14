import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});
const client = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
export const db = drizzle(client);
