import { ImageCarousel } from "@/ImageCarousel";
import zap from "../components/zap.png";
import { Id } from "../../convex/_generated/dataModel";
import Zap from "./Zap";

interface ItemModalProps {
  item: {
    _id: Id<"items">;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    imageUrls?: (string | null)[];
  } | null;
  onClose: () => void;
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  if (!item) return null;

  const handleWhatsAppClick = () => {
    const message = `Olá! Gostaria de saber mais sobre o produto: ${item.name} - R$ ${item.price.toFixed(2)}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://api.whatsapp.com/send?phone=555384747156&text=${encodedMessage}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagens */}
            <div>
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <ImageCarousel
                  images={item.imageUrls.filter(Boolean) as string[]}
                  alt={item.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Sem imagem</span>
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="space-y-6">
              {/* Preço e Estoque */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
              </div>

              {/* Descrição */}
              {item.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Botão de Contato */}
              <div className="pt-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Zap />
                  Entrar em Contato
                </button>
              </div>

              {/* Informações Adicionais */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Disponibilidade:</span>
                    <p className="text-gray-500">
                      {item.quantity > 0 ? "Disponível" : "Indisponível"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
