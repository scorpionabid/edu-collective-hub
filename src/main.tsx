
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <QueryProvider>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </TooltipProvider>
    </BrowserRouter>
  </React.StrictMode>
);
