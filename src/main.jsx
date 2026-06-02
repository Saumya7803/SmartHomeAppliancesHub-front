import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { CustomerAuthProvider } from "./customer/context/CustomerAuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminAuthProvider>
      <CustomerAuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CustomerAuthProvider>
    </AdminAuthProvider>
  </StrictMode>
);
