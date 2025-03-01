
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <QueryProvider>
          <App />
          <Toaster />
        </QueryProvider>
      </TooltipProvider>
    </BrowserRouter>
  </React.StrictMode>
);
