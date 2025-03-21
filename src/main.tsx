import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/roboto";

import App from "./App";

//Had to remove authenticator in this portion, must readd
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
