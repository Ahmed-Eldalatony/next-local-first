"use cliet"
import { createAppStore } from "./lib/store";
import { Provider } from "tinybase/ui-react";

const store = createAppStore();

function MyApp() {
  return (
    <Provider store={store}>
      <div>hello</div>
    </Provider>
  );
}

export default MyApp;
