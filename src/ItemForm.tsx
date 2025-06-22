import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../convex/_generated/dataModel";

interface ItemFormProps {
  item?: {
    _id: Id<"items">;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    imageId?: Id<"_storage">;
    imageUrl?: string;
  } | null;
  categoryId: Id<"categories">;
  onClose: () => void;
}

export function ItemForm({ item, categoryId, onClose }: ItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createItem = useMutation(api.items.create);
  const updateItem = useMutation(api.items.update);
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !quantity) return;

    try {
      setUploading(true);
      let imageId = item?.imageId;

      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        imageId = json.storageId;
      }

      const itemData = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        imageId,
      };

      if (item) {
        await updateItem({
          id: item._id,
          ...itemData,
        });
        toast.success("Item atualizado com sucesso");
      } else {
        await createItem({
          ...itemData,
          categoryId,
        });
        toast.success("Item criado com sucesso");
      }

      onClose();
    } catch (error) {
      toast.error("Falha ao salvar item");
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e).catch(console.error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {item ? "Editar Item" : "Adicionar Item"}
        </h2>

        <form onSubmit={handleFormSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
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
            {item?.imageUrl && !selectedImage && (
              <img
                src={item.imageUrl}
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
              disabled={!name.trim() || !price || !quantity || uploading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Salvando..." : item ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
