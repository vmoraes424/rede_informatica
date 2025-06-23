import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ImageCarousel } from "./ImageCarousel";
import type { Id } from "../convex/_generated/dataModel";
import zap from "./components/zap.png";

export function Storefront() {
  const categories = useQuery(api.categories.listPublic) || [];
  const [selectedCategory, setSelectedCategory] =
    useState<Id<"categories"> | null>(null);

  const items =
    useQuery(
      api.items.listByCategory,
      selectedCategory ? { categoryId: selectedCategory } : "skip"
    ) || [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <img
        onClick={() =>
          window.open("https://api.whatsapp.com/send?phone=555384747156")
        }
        src={zap}
        alt="Logo do WhatsApp"
        className="fixed bottom-0 right-0 w-32 rounded-full cursor-pointer"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loja Virtual</h1>
        <p className="text-gray-600">
          Navegue por todos os produtos disponíveis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Categorias */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Categorias</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedCategory === null
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Todos os Produtos
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 ${
                    selectedCategory === category._id
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

        {/* Grade de Produtos */}
        <div className="lg:col-span-3">
          {selectedCategory === null ? (
            // Mostrar todas as categorias com seus produtos
            <div className="space-y-8">
              {categories.map((category) => (
                <CategorySection key={category._id} category={category} />
              ))}
            </div>
          ) : (
            // Mostrar produtos da categoria selecionada
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                {categories.find((c) => c._id === selectedCategory)?.name}
              </h2>
              <ItemGrid items={items} />
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
