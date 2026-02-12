import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./i18n";
import App from "./App";
import { AppProvider } from "./context/AppContext";

globalThis.__N8N_BASE_URL__ = import.meta.env.VITE_N8N_BASE_URL || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
