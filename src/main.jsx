// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import axios from "axios";

// по желба: централен baseURL за axios
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";
axios.defaults.headers.post["Content-Type"] = "application/json";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
