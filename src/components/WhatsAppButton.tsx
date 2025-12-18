import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
}

export function WhatsAppButton({
  phoneNumber = "5534999999999",
  message = "Olá! Vi o Raio-X da Mulher e gostaria de ser acompanhada pela Dra. Izabella Brasão.",
  className = ""
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      variant="brand"
      size="xl"
      onClick={handleClick}
      className={className}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Eu quero ser acompanhada pela Dra Izabella Brasão
    </Button>
  );
}
