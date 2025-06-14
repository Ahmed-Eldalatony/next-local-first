import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(), // Changed from integer to text to support UUIDs
  title: text("title").notNull(),
  done: integer("done").default(0).notNull(),
});
