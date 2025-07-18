import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { CategoryPage } from "./CategoryPage";

export function Storefront() {
  const categories = useQuery(api.categories.listPublic) || [];
  const [selectedCategory, setSelectedCategory] =
    useState<Id<"categories"> | null>(null);
  const banner = useQuery(api.banner.getPublic);

  // If a category is selected, show the category page
  if (selectedCategory) {
    const category = categories.find((c) => c._id === selectedCategory);
    return (
      <CategoryPage
        category={category}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  // Show categories grid
  return (
    <div className="max-w-7xl mx-auto px-4 mb-12">
      {banner?.imageUrl && (
        <div className="mb-8">
          <div className="relative h-48 md:h-64 lg:h-56 overflow-hidden rounded-lg">
            <img
              src={banner.imageUrl}
              alt="Banner da loja"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {banner?.imageUrl ? "Categorias" : "Loja"}
        </h1>
        <p className="text-gray-600">Navegue pelas categorias disponíveis</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
          >
            {category.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {category.description}
                </p>
              )}
              <div className="mt-4 flex items-center text-primary font-medium">
                <span>Ver produtos</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold mb-2">
            Nenhuma categoria disponível
          </h3>
          <p>As categorias aparecerão aqui quando forem criadas.</p>
        </div>
      )}
    </div>
  );
}
