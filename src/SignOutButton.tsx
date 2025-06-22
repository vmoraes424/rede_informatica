"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { redirect } from "react-router";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded bg-white text-secondary border border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-sm hover:shadow"
      onClick={() => {
        void signOut();
        redirect("/login");
      }}
    >
      Sair da Conta
    </button>
  );
}
