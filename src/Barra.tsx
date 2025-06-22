import { useConvexAuth } from "convex/react";
import React from "react";
import { Navigate } from "react-router";

export default function Barra() {
  const { isAuthenticated } = useConvexAuth();

  if (!isAuthenticated) {
    return <Navigate to="/loja" replace />;
  }

  return <div></div>;
}
