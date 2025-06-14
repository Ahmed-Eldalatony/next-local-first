import { createStore, Store } from "tinybase";
import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db";
import { createCustomPersister } from "tinybase/persisters";

export function createAppStore(): Store {
  const store = createStore();
  store.setTables({ todos: {} });

  // 1. IndexedDB persister for local-first caching
  createIndexedDbPersister(store, "todo-store", 1, (e) => {
    if (process.env.NODE_ENV === "development") {
      console.error("IndexedDB Persister ignored error:", e);
    }
  })
    .startAutoLoad()
    .then((persister) => persister.startAutoSave())
    .catch((e) => console.error("IndexedDB Persister setup error:", e));

  // 2. Custom persister to sync with your backend (Turso)
  createCustomPersister(
    store,
    // load function
    async () => {
      const res = await fetch("/api/todos");
      if (!res.ok) {
        console.error("Failed loading from /api/todos:", res.status);
        throw new Error(`HTTP ${res.status}`);
      }
      // Expecting { tables: { todos: {...} } }
      const { tables } = await res.json();
      return tables;
    },
    // save function using getContent()
    async (getContent) => {
      const tables = getContent();
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables }),
      });
      if (!res.ok) {
        console.error("Failed saving to /api/todos:", res.status);
        throw new Error(`HTTP ${res.status}`);
      }
    },
    // optional: subscribe to backend push notifications (e.g. WebSocket)
    (listener) => {
      // if implementing WS: ws.onmessage = () => listener();
      // return ws;
    },
    (subscription) => {
      // e.g., subscription.close();
    }
  )
    .startAutoLoad()
    .then((persister) => persister.startAutoSave())
    .catch((e) => console.error("Custom Persister error:", e));

  return store;
}
