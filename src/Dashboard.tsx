import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { CategoryForm } from "./CategoryForm";
import { ItemForm } from "./ItemForm";
import { ImageCarousel } from "./ImageCarousel";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";
import { Navigate } from "react-router";

export function Dashboard() {
  const categories = useQuery(api.categories.list) || [];
  const [selectedCategory, setSelectedCategory] =
    useState<Id<"categories"> | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { isAuthenticated } = useConvexAuth();

  const items =
    useQuery(
      api.items.listByCategory,
      selectedCategory ? { categoryId: selectedCategory } : "skip"
    ) || [];

  const deleteCategory = useMutation(api.categories.remove);
  const deleteItem = useMutation(api.items.remove);

  const handleDeleteCategory = async (id: Id<"categories">) => {
    if (confirm("Are you sure? This will delete all items in this category.")) {
      try {
        await deleteCategory({ id });
        toast.success("Category deleted successfully");
        if (selectedCategory === id) {
          setSelectedCategory(null);
        }
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleDeleteItem = async (id: Id<"items">) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem({ id });
        toast.success("Item deleted successfully");
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel</h1>
        <p className="text-gray-600">Gerencie suas categorias e itens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Categorias</h2>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-hover transition-colors"
              >
                Adicionar Categoria
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategory === category._id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedCategory(category._id)}
                >
                  <div className="flex items-center gap-3">
                    {category.imageUrl && (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 truncate">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(category);
                          setShowCategoryForm(true);
                        }}
                        className="text-gray-400 hover:text-primary text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category._id).catch(
                            console.error
                          );
                        }}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Itens{" "}
                {selectedCategory &&
                  `em ${categories.find((c) => c._id === selectedCategory)?.name}`}
              </h2>
              {selectedCategory && (
                <button
                  onClick={() => setShowItemForm(true)}
                  className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-hover transition-colors"
                >
                  Adicionar Item
                </button>
              )}
            </div>

            {!selectedCategory ? (
              <div className="text-center py-12 text-gray-500">
                Selecione uma categoria para visualizar os itens
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4">
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mb-3">
                        <ImageCarousel
                          images={item.imageUrls.filter(Boolean) as string[]}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    <h3 className="font-medium mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">
                        R$ {item.price.toFixed(2)}
                      </span>
                      <span className="text-gray-600">
                        Qtd: {item.quantity}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowItemForm(true);
                        }}
                        className="text-primary hover:underline text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteItem(item._id).catch(console.error);
                        }}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forms */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showItemForm && selectedCategory && (
        <ItemForm
          item={editingItem}
          categoryId={selectedCategory}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
