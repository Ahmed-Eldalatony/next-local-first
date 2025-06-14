import { createStore } from "tinybase";
import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db";
import { createLibSqlPersister } from "tinybase/persisters/persister-libsql";
import { db as tursoDb } from "./db";

export function createAppStore() {
  const store = createStore();
  store.setTables({ todos: {} });
  createIndexedDbPersister(store, "todo-store").startAutoLoad().then(p => p.startAutoSave());
  createLibSqlPersister(store, tursoDb, {
    mode: "tabular",
    tables: {
      load: { todos: { tableId: "todos", rowIdColumnName: "id" } },
      save: { todos: { tableName: "todos", rowIdColumnName: "id" } },
    },
  }).startAutoLoad().then(p => p.startAutoSave());
  return store;
}
