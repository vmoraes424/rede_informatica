import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Dashboard } from "./Dashboard";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import { Storefront } from "./Storefront";
import App from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loja" element={<Storefront />} />
        <Route path="/login" element={<App />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
  </ConvexAuthProvider>
);
