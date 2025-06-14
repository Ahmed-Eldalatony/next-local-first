import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!,
});

export const db = drizzle(client);
