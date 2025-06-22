import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

interface CategoryFormProps {
  category?: {
    _id: Id<"categories">;
    name: string;
    description?: string;
    imageId?: Id<"_storage">;
    imageUrl?: string;
  } | null;
  onClose: () => void;
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const generateUploadUrl = useMutation(api.categories.generateUploadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setUploading(true);
      let imageId = category?.imageId;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Falha no upload: ${JSON.stringify(json)}`);
        }
        imageId = json.storageId;
      }

      if (category) {
        await updateCategory({
          id: category._id,
          name: name.trim(),
          description: description.trim() || undefined,
          imageId,
        });
        toast.success("Categoria atualizada com sucesso");
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
          imageId,
        });
        toast.success("Categoria criada com sucesso");
      }

      onClose();
    } catch (error) {
      toast.error("Falha ao salvar categoria");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {category ? "Editar Categoria" : "Adicionar Categoria"}
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {category?.imageUrl && !selectedImage && (
              <img
                src={category.imageUrl}
                alt="Imagem atual"
                className="mt-2 w-20 h-20 object-cover rounded"
              />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || uploading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Salvando..." : category ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
