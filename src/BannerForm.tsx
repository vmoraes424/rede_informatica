/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface BannerFormProps {
  onClose: () => void;
}

// Image compression utility
const compressImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export function BannerForm({ onClose }: BannerFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const banner = useQuery(api.banner.get);
  const createBanner = useMutation(api.banner.create);
  const removeBanner = useMutation(api.banner.remove);
  const generateUploadUrl = useMutation(api.banner.generateUploadUrl);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file, 1200, 400, 0.8);
        setSelectedImage(compressedFile);
      } catch (error) {
        toast.error("Falha ao processar imagem");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    try {
      setUploading(true);

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

      await createBanner({
        imageId: json.storageId,
      });

      toast.success("Banner atualizado com sucesso");
      onClose();
    } catch (error) {
      toast.error("Falha ao salvar banner");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Tem certeza que deseja remover o banner?")) {
      try {
        await removeBanner();
        toast.success("Banner removido com sucesso");
        onClose();
      } catch (error) {
        toast.error("Falha ao remover banner");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Gerenciar Banner da Loja</h2>

        {banner?.imageUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Banner atual:
            </p>
            <img
              src={banner.imageUrl}
              alt="Banner atual"
              className="w-full h-24 object-cover rounded border"
            />
            <button
              onClick={handleRemove}
              className="mt-2 text-red-500 hover:text-red-700 text-sm"
            >
              Remover banner
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {banner ? "Novo Banner" : "Banner da Loja"} (1200x400px
              recomendado)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            {selectedImage && (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Novo banner"
                className="mt-2 w-full h-24 object-cover rounded"
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
              disabled={!selectedImage || uploading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Salvando..." : banner ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
