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
    imageIds?: Id<"_storage">[];
    imageUrls?: (string | null)[];
  } | null;
  categoryId: Id<"categories">;
  onClose: () => void;
}

export function ItemForm({ item, categoryId, onClose }: ItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [currentImageIds, setCurrentImageIds] = useState<Id<"_storage">[]>(
    item?.imageIds || []
  );
  const [currentImageUrls, setCurrentImageUrls] = useState<(string | null)[]>(
    item?.imageUrls || []
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createItem = useMutation(api.items.create);
  const updateItem = useMutation(api.items.update);
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = selectedImages.length + currentImageIds.length;

    if (totalImages + files.length > 5) {
      toast.error("Você só pode fazer upload de até 5 imagens por item");
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImageIds(currentImageIds.filter((_, i) => i !== index));
    setCurrentImageUrls(currentImageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !quantity) return;

    try {
      setUploading(true);
      let imageIds = [...currentImageIds];

      // Upload new images
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (image) => {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
          });
          const json = await result.json();
          if (!result.ok) {
            throw new Error(`Upload failed: ${JSON.stringify(json)}`);
          }
          return json.storageId;
        });

        const newImageIds = await Promise.all(uploadPromises);
        imageIds = [...imageIds, ...newImageIds];
      }

      const itemData = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        imageIds: imageIds.length > 0 ? imageIds : undefined,
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
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {item ? "Editar Item" : "Adicionar Item"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e).catch(console.error);
          }}
          className="space-y-4"
        >
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
              Imagens (até 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            {/* Current Images */}
            {currentImageUrls.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Imagens atuais:</p>
                <div className="grid grid-cols-5 gap-2">
                  {currentImageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url!}
                        alt={`Imagem atual ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeCurrentImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  Novas imagens para upload:
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Prévia ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Total de imagens: {currentImageIds.length + selectedImages.length}
              /5
            </p>
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
