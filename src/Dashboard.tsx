/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { CategoryForm } from "./CategoryForm";
import { ItemForm } from "./ItemForm";
import { ImageCarousel } from "./ImageCarousel";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";
import { BannerForm } from "./BannerForm";

export function Dashboard() {
  const categories = useQuery(api.categories.list) || [];
  const banner = useQuery(api.banner.get);
  const [selectedCategory, setSelectedCategory] =
    useState<Id<"categories"> | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const items =
    useQuery(
      api.items.listByCategory,
      selectedCategory ? { categoryId: selectedCategory } : "skip"
    ) || [];

  const deleteCategory = useMutation(api.categories.remove);
  const deleteItem = useMutation(api.items.remove);

  const handleDeleteCategory = async (id: Id<"categories">) => {
    if (confirm("Tem certeza? Isso excluirá todos os itens desta categoria.")) {
      try {
        await deleteCategory({ id });
        toast.success("Categoria excluída com sucesso");
        if (selectedCategory === id) {
          setSelectedCategory(null);
        }
      } catch (error) {
        toast.error("Falha ao excluir categoria");
      }
    }
  };

  const handleDeleteItem = async (id: Id<"items">) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await deleteItem({ id });
        toast.success("Item excluído com sucesso");
      } catch (error) {
        toast.error("Falha ao excluir item");
      }
    }
  };

  const selectedCategoryData = selectedCategory
    ? categories.find((c) => c._id === selectedCategory)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 mb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel</h1>
        <p className="text-gray-600">
          Gerencie suas categorias, itens e banner da loja
        </p>
      </div>

      {/* Banner Management Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Banner da Loja</h2>
            <button
              onClick={() => setShowBannerForm(true)}
              className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-hover transition-colors"
            >
              {banner ? "Alterar Banner" : "Adicionar Banner"}
            </button>
          </div>

          {banner?.imageUrl ? (
            <div className="relative">
              <img
                src={banner.imageUrl}
                alt="Banner da loja"
                className="w-full h-32 object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">Banner da Loja</span>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🏪</div>
                <p className="text-sm text-blue-600 font-medium">
                  Nenhum banner configurado
                </p>
                <p className="text-xs text-blue-500">
                  Adicione um banner para aparecer no topo da loja
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Banner Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Banner da Categoria
                </h3>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-hover transition-colors"
                >
                  Adicionar Categoria
                </button>
              </div>

              {selectedCategoryData ? (
                selectedCategoryData.bannerUrl ? (
                  <div className="relative">
                    <img
                      src={selectedCategoryData.bannerUrl}
                      alt={`Banner de ${selectedCategoryData.name}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        Banner de {selectedCategoryData.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎨</div>
                      <p className="text-sm text-blue-600 font-medium">
                        Sem banner
                      </p>
                      <p className="text-xs text-blue-500">
                        Adicione um banner para esta categoria
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-24 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📋</div>
                    <p className="text-sm text-gray-600 font-medium">
                      Selecione uma categoria
                    </p>
                    <p className="text-xs text-gray-500">
                      para visualizar seu banner
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Categorias</h2>
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
                      {category.bannerUrl && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded mt-1 inline-block">
                          Com banner
                        </span>
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
                          handleDeleteCategory(category._id);
                        }}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Banner preview */}
                  {category.bannerUrl && (
                    <div className="mt-3">
                      <img
                        src={category.bannerUrl}
                        alt={`Banner de ${category.name}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    </div>
                  )}
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
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Excluir
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

      {showBannerForm && (
        <BannerForm onClose={() => setShowBannerForm(false)} />
      )}
    </div>
  );
}
