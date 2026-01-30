import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./auth/AuthProvider.jsx";
import AuthSyncProvider from "./auth/AuthSyncProvider.jsx";
import "./index.css";
import {NotificationProvider} from "./context/NotificationContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthSyncProvider>
          <NotificationProvider> 
           <App />
          </NotificationProvider>
        </AuthSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
