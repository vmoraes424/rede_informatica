// src/components/Navbar.jsx

import { SignOutButton } from "@/SignOutButton";
import { Authenticated } from "convex/react";
import { useState, Fragment } from "react";
import { Link } from "react-router";

// Defina os links de navegação em um só lugar para evitar repetição
const navLinks = [
  { href: "/dashboard", label: "Painel" },
  { href: "/loja", label: "Loja" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Componente para o ícone de hambúrguer animado
  const AnimatedBurgerIcon = () => (
    <div className="w-7 h-7 flex flex-col justify-around items-center">
      <span
        className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
          menuOpen ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-6 bg-current transition duration-300 ease-in-out ${
          menuOpen ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
          menuOpen ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
    </div>
  );

  return (
    <header className="sticky mb-10 top-0 z-50 bg-white/80 h-16 flex justify-between items-center border-b shadow-sm px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-primary">
            Rede Informática
          </h2>
        </div>

        <Authenticated>
          {/* Menu de Navegação para Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <button className="px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                  {link.label}
                </button>
              </Link>
            ))}
            <div className="ml-4">
              <SignOutButton />
            </div>
          </nav>

          {/* Botão do Menu Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 z-40 relative"
              aria-label="Toggle menu"
            >
              <AnimatedBurgerIcon />
            </button>
          </div>
        </Authenticated>
      </div>

      {/* Sheet (Painel Lateral) para o Menu Mobile */}
      <Authenticated>
        {menuOpen && (
          <Fragment>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-20 animate-fade-in"
              onClick={() => setMenuOpen(false)}
            />

            {/* Conteúdo do Menu */}
            <div
              className="fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white z-30 shadow-lg p-6 flex flex-col gap-4 animate-sheet-in"
              // data-state={menuOpen ? "open" : "closed"}
              // className="... data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out"
              // Usar data-state é o padrão do Radix, mas para simplificar, a remoção do DOM já dispara a lógica implícita.
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary">Menu</h2>
              </div>
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <button className="w-full text-left px-3 py-2 rounded text-base font-medium hover:bg-gray-100 transition-colors">
                      {link.label}
                    </button>
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4">
                  <SignOutButton />
                </div>
              </nav>
            </div>
          </Fragment>
        )}
      </Authenticated>
    </header>
  );
}
