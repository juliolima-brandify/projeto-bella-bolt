import { useState } from "react";
import { ArrowRight, User, Mail, Phone, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LeadData {
  name: string;
  email: string;
  whatsapp: string;
  city: string;
}

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadData) => void;
  isLoading?: boolean;
}

export function LeadCaptureModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<LeadData>({
    name: "",
    email: "",
    whatsapp: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<LeadData>>({});

  const formatWhatsApp = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    
    // Apply Brazilian phone mask (XX) XXXXX-XXXX
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleChange = (field: keyof LeadData, value: string) => {
    if (field === "whatsapp") {
      value = formatWhatsApp(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (formData.whatsapp.replace(/\D/g, "").length < 10) {
      newErrors.whatsapp = "WhatsApp incompleto";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.whatsapp.replace(/\D/g, "").length >= 10 &&
    formData.city.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card border-2 border-serene-sand shadow-2xl opacity-100">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-primary text-center">
            Quase lá!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Preencha seus dados para liberar seu relatório personalizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-primary flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`h-12 rounded-xl border-serene-sand focus:border-primary bg-surface ${
                errors.name ? "border-destructive" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-primary flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`h-12 rounded-xl border-serene-sand focus:border-primary bg-surface ${
                errors.email ? "border-destructive" : ""
              }`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium text-primary flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              className={`h-12 rounded-xl border-serene-sand focus:border-primary bg-surface ${
                errors.whatsapp ? "border-destructive" : ""
              }`}
            />
            {errors.whatsapp && (
              <p className="text-xs text-destructive">{errors.whatsapp}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Cidade
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Sua cidade"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={`h-12 rounded-xl border-serene-sand focus:border-primary bg-surface ${
                errors.city ? "border-destructive" : ""
              }`}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city}</p>
            )}
          </div>

          <Button
            type="submit"
            variant={isFormValid ? "brand-success" : "brand"}
            size="xl"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Gerando seu relatório...
              </>
            ) : (
              <>
                Liberar Relatório
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Seus dados estão seguros e não serão compartilhados.
        </p>
      </DialogContent>
    </Dialog>
  );
}
