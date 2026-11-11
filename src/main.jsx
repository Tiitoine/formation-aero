import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Pas de <StrictMode> : en développement il exécuterait deux fois l'effet
// de fin de QCM et compterait deux tentatives pour un seul passage.
createRoot(document.getElementById("root")).render(<App />);
