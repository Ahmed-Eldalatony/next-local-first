import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  done: integer("done").default(0).notNull(),
});
