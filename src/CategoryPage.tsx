/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ImageCarousel } from "./ImageCarousel";
import type { Id } from "../convex/_generated/dataModel";
import { ItemModal } from "./components/ItemModal";

interface CategoryPageProps {
  category?: {
    _id: Id<"categories">;
    name: string;
    description?: string;
    imageUrl?: string | null;
  };
  onBack: () => void;
}

export function CategoryPage({ category, onBack }: CategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const items =
    useQuery(
      api.items.listByCategory,
      category ? { categoryId: category._id } : "skip"
    ) || [];

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 text-gray-500">
          <h3 className="text-xl font-semibold mb-2">
            Categoria não encontrada
          </h3>
          <button onClick={onBack} className="text-primary hover:underline">
            Voltar às categorias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mb-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-primary hover:text-primary-hover mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar às categorias
        </button>

        <div className="flex items-center gap-6 mb-6">
          {category.imageUrl && (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-20 h-20 rounded-lg object-cover shadow-sm"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 text-lg">{category.description}</p>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
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
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {searchQuery ? (
            <>
              Mostrando {filteredItems.length} resultado
              {filteredItems.length !== 1 ? "s" : ""} para "{searchQuery}"
            </>
          ) : (
            <>
              {items.length} produto{items.length !== 1 ? "s" : ""} disponível
              {items.length !== 1 ? "eis" : ""}
            </>
          )}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-primary hover:text-primary-hover text-sm"
          >
            Limpar busca
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">
                Nenhum produto encontrado
              </h3>
              <p>
                Tente buscar com outros termos ou navegue pelos produtos
                disponíveis.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">
                Nenhum produto disponível
              </h3>
              <p>Esta categoria ainda não possui produtos.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {item.imageUrls && item.imageUrls.length > 0 && (
                <ImageCarousel
                  images={item.imageUrls.filter(Boolean) as string[]}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex justify-between items-start flex-col gap-2">
                  <span className="text-lg font-bold text-primary">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.quantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.quantity > 0
                      ? `${item.quantity} em estoque`
                      : "Fora de estoque"}
                  </span>
                </div>
                {item.quantity === 0 && (
                  <div className="mt-3 text-center py-2 bg-gray-100 rounded text-gray-500 text-sm">
                    Indisponível
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
