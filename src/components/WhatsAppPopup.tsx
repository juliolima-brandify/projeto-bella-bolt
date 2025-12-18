import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface WhatsAppPopupProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppPopup({
  phoneNumber = "5534999999999",
  message = "Olá! Vi o Raio-X da Mulher e gostaria de mais informações."
}: WhatsAppPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Show popup after 30 seconds if not closed
    const timer = setTimeout(() => {
      if (!isClosed) {
        setIsVisible(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isClosed]);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-up">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-green-500">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-primary mb-1">
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-muted-foreground">
              Fale diretamente com a Dra. Izabella pelo WhatsApp
            </p>
          </div>
        </div>

        <Button
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleClick}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chamar no WhatsApp
        </Button>
      </div>
    </div>
  );
}
