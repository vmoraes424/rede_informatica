import { SignOutButton } from "@/SignOutButton";
import { Authenticated } from "convex/react";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <header className="sticky mb-10 top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-12">
      <div className=" max-w-7xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-primary">
            Rede Informática
          </h2>
          <Authenticated>
            <nav className="flex gap-2">
              <Link to={"/dashboard"}>
                <button
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors`}
                >
                  Painel
                </button>
              </Link>
              <Link to={"/loja"}>
                <button
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors`}
                >
                  Loja
                </button>
              </Link>
            </nav>
          </Authenticated>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
