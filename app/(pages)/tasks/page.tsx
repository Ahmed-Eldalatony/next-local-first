"use client";
import { useState } from "react";
import { Provider, useStore, useTable } from "tinybase/ui-react";
import { createAppStore } from "@/app/lib/store";

// Instantiate the store once, outside component render
const store = createAppStore();

export default function Home() {
  const [text, setText] = useState("");

  return (
    <Provider store={store}>
      <TodoList text={text} setText={setText} />
    </Provider>
  );
}

function TodoList({ text, setText }) {
  const store = useStore();                     // ✅ Gets the context store
  const rows = useTable("todos", store);        // ✅ Reads table data

  const addTodo = () => {
    const id = crypto.randomUUID();
    store.setRow("todos", id, { id, title: text, done: 0 });
    setText("");
  };

  const toggle = (id, done) =>
    store.setCell("todos", id, "done", done ? 0 : 1);

  const del = (id) => store.delRow("todos", id);

  return (
    <div>
      <h1>To‑Dos</h1>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {Object.entries(rows).map(([id, row]) => (
          <li key={id}>
            <input
              type="checkbox"
              checked={row.done === 1}
              onChange={() => toggle(id, row.done)}
            />
            {row.title}
            <button onClick={() => del(id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}



// You're really close! The issue is that you're creating your store *inside* a client component, and then trying to use context hooks (`useTable` and `useStore`) *outside* that context. Here's a revised version that follows TinyBase's recommended pattern:
//
// ---
//
// ### ✅ Corrected `page.tsx` (in `app/` folder, `"use client"`)
//
// ```tsx
// "use client";
// import { useState } from "react";
// import { Provider, useStore, useTable } from "tinybase/ui-react";
// import { createAppStore } from "@/app/lib/store";
//
// // Instantiate the store once, outside component render
// const store = createAppStore();
//
// export default function Home() {
//   const [text, setText] = useState("");
//
//   return (
//     <Provider store={store}>
//       <TodoList text={text} setText={setText} />
//     </Provider>
//   );
// }
//
// function TodoList({ text, setText }) {
//   const store = useStore();                     // ✅ Gets the context store
//   const rows = useTable("todos", store);        // ✅ Reads table data
//
//   const addTodo = () => {
//     const id = crypto.randomUUID();
//     store.setRow("todos", id, { id, title: text, done: 0 });
//     setText("");
//   };
//
//   const toggle = (id, done) =>
//     store.setCell("todos", id, "done", done ? 0 : 1);
//
//   const del = (id) => store.delRow("todos", id);
//
//   return (
//     <div>
//       <h1>To‑Dos</h1>
//       <input value={text} onChange={(e) => setText(e.target.value)} />
//       <button onClick={addTodo}>Add</button>
//       <ul>
//         {Object.entries(rows).map(([id, row]) => (
//           <li key={id}>
//             <input
//               type="checkbox"
//               checked={row.done === 1}
//               onChange={() => toggle(id, row.done)}
//             />
//             {row.title}
//             <button onClick={() => del(id)}>X</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// ```
//
// ---
//
// ### 🔍 What Was Wrong
//
// 1. You were calling `createAppStore()` each render of the page—this creates **new stores every time**, so context mismatches happen.
// 2. You used `useTable("todos")` without providing the store, so it didn’t know which store to read from.
// 3. The `Provider` wrapped only the inner JSX—hooks outside or with mismatched context won't work.
//
// ---
//
// ### 📚 Why This Works
//
// * **Store is singleton** in module scope—so state persists across re-renders.
// * **Provider** wraps the UI subtree, so `useStore()` gets that exact store.
// * **Hook usage aligns** with store context, so `useTable()` returns the current table contents and re-renders reactively. ([tinybase.org][1])
//
// ---
//
// ### 🚀 Final Tips
//
// * Always create the store *outside* the React component function to keep it stable.
// * Use `<Provider store={store}>` around any component that calls TinyBase hooks.
// * Inside the provider, always pass the store—either implicitly (hooks pick it up) or explicitly (`useTable("todos", store)`).
//
// With this setup, your TinyBase-backed to‑do list will work smoothly. Let me know if you want to integrate persisters or Drizzle/Turso sync next!
//
// [1]: https://tinybase.org/api/ui-react/functions/store-hooks/usetables/?utm_source=chatgpt.com "useTables - TinyBase"
