import { Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";

export default function App() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Rede Informática
            </h1>
            <p className="text-gray-600">
              Faça login para gerenciar seu estoque
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
