import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import zap from "./components/zap.png";

export function Storefront() {
  const categories = useQuery(api.categories.listPublic) || [];
  const [selectedCategory, setSelectedCategory] =
    useState<Id<"categories"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar itens baseado na pesquisa ou categoria selecionada
  const searchResults = useQuery(
    api.items.searchItems,
    searchTerm.trim()
      ? {
          searchTerm: searchTerm.trim(),
          categoryId: selectedCategory || undefined,
        }
      : "skip"
  );

  const items =
    useQuery(
      api.items.listByCategory,
      selectedCategory && !searchTerm.trim()
        ? { categoryId: selectedCategory }
        : "skip"
    ) || [];

  // Determinar quais itens mostrar
  const displayItems = searchTerm.trim() ? searchResults || [] : items;

  return (
    <div className="max-w-7xl mx-auto my-12 px-12">
      <img
        onClick={() =>
          window.open("https://api.whatsapp.com/send?phone=555384747156")
        }
        src={zap}
        alt="Whatsapp logo"
        className="fixed bottom-0 right-0 w-32 rounded-full cursor-pointer"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loja Virtual</h1>
        <p className="text-gray-600">
          Navegue por todos os produtos disponíveis
        </p>

        {/* Barra de Pesquisa */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Pesquisar produtos ou categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Categorias</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm("");
                }}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedCategory === null && !searchTerm
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Todos os Produtos
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => {
                    setSelectedCategory(category._id);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 ${
                    selectedCategory === category._id && !searchTerm
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  <span className="truncate">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="lg:col-span-3">
          {searchTerm.trim() ? (
            // Mostrar resultados da pesquisa
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  Resultados da pesquisa para "{searchTerm}"
                </h2>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-primary hover:text-primary-hover text-sm"
                >
                  Limpar pesquisa
                </button>
              </div>
              <ItemGrid items={displayItems} />
            </div>
          ) : selectedCategory === null ? (
            // Mostrar todas as categorias com seus itens
            <div className="space-y-8">
              {categories.map((category) => (
                <CategorySection key={category._id} category={category} />
              ))}
            </div>
          ) : (
            // Mostrar itens da categoria selecionada
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                {categories.find((c) => c._id === selectedCategory)?.name}
              </h2>
              <ItemGrid items={displayItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: any }) {
  const items =
    useQuery(api.items.listByCategory, { categoryId: category._id }) || [];

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        {category.imageUrl && (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-semibold">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>
      </div>
      <ItemGrid items={items} />
    </div>
  );
}

function ItemGrid({ items }: { items: any[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhum produto disponível
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item._id}
          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
        >
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
            {item.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">
                R$ {item.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                {item.quantity > 0
                  ? `${item.quantity} em estoque`
                  : "Fora de estoque"}
              </span>
            </div>
            {item.quantity === 0 && (
              <div className="mt-2 text-center py-2 bg-gray-100 rounded text-gray-500 text-sm">
                Fora de Estoque
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
