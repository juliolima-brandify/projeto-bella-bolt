import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lightbulb, Heart, Sparkles, Dna } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { OrganicShapes } from "./OrganicShapes";
import { BrandHeader } from "./BrandHeader";
import backgroundHero from "@/assets/background-hero.webp";
import { ImageUpload } from "./ImageUpload";
import { LoadingState } from "./LoadingState";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { SymptomsSelector } from "./SymptomsSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateBMI, calculateIdealWeight, calculateTMB } from "@/lib/health-calculations";
interface FormData {
  age: string;
  weight: string;
  height: string;
  symptoms: string[];
}
interface LeadData {
  name: string;
  email: string;
  whatsapp: string;
  city: string;
}
export function VisionBodyApp() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<FormData>({
    age: "",
    weight: "",
    height: "",
    symptoms: []
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [skippedPhoto, setSkippedPhoto] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFormChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleImageSelect = (file: File, preview: string) => {
    setUploadedImage(preview);
    setUploadedFile(file);
    setSkippedPhoto(false);
  };
  const handleSkipPhotoToggle = (skip: boolean) => {
    setSkippedPhoto(skip);
    if (skip) {
      setUploadedImage(null);
      setUploadedFile(null);
    }
  };
  const isFormValid = formData.age && formData.weight && formData.height && (uploadedImage || skippedPhoto);
  const handleOpenModal = () => {
    if (!isFormValid) {
      toast({
        title: "Preencha todos os campos",
        description: "Por favor, preencha todos os dados.",
        variant: "destructive"
      });
      return;
    }
    setIsModalOpen(true);
  };
  const handleLeadSubmit = async (leadData: LeadData) => {
    // Prevent multiple submissions
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      setIsModalOpen(false);

      const weight = Number(formData.weight);
      let height = Number(formData.height);
      const age = Number(formData.age);

      // Validate numeric inputs
      if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0) {
        throw new Error("Dados inválidos. Por favor, verifique os valores informados.");
      }

      // Convert height from meters to cm if needed (if user entered 1.65 instead of 165)
      if (height < 3) {
        height = height * 100;
      }

      // Calculate health metrics
      const bmiCurrent = calculateBMI(weight, height);
      const idealWeight = calculateIdealWeight(height);
      const tmb = calculateTMB(weight, height, age);

      // Save lead to database
      const {
        data: leadResult,
        error: insertError
      } = await supabase.from("leads").insert({
        name: leadData.name,
        email: leadData.email,
        whatsapp: leadData.whatsapp,
        city: leadData.city,
        age: age,
        weight: weight,
        height: height,
        goal_weight: idealWeight,
        bmi_current: bmiCurrent,
        bmi_ideal: 22,
        ideal_weight: idealWeight,
        tmb: tmb,
        symptoms: formData.symptoms,
        gender: "feminino"
      }).select().single();

      if (insertError) {
        console.error("Error saving lead:", insertError);
        throw new Error("Erro ao salvar seus dados. Por favor, tente novamente.");
      }

      const leadId = leadResult?.id;

      // Handle image transformation or skip if no photo
      let transformedImage = null;

      if (uploadedImage && !skippedPhoto) {
        try {
          const { data, error } = await supabase.functions.invoke("generate-transformation", {
            body: {
              imageBase64: uploadedImage,
              currentWeight: weight,
              goalWeight: idealWeight,
              height: height,
              leadId: leadId
            }
          });

          if (error) {
            console.error("Edge function error:", error);
            // Continue without transformed image if error occurs
          } else if (data?.transformedImage) {
            transformedImage = data.transformedImage;
          }
        } catch (imgError) {
          console.error("Image transformation error:", imgError);
          // Continue without transformed image if error occurs
        }
      }

      // Navigate to result page with data
      navigate("/relatorio", {
        state: {
          name: leadData.name,
          weight: weight,
          height: height,
          goalWeight: idealWeight,
          age: age,
          bmiCurrent: bmiCurrent,
          tmb: tmb,
          symptoms: formData.symptoms,
          originalImage: uploadedImage || null,
          transformedImage: transformedImage,
          hasPhoto: !skippedPhoto && !!uploadedImage
        }
      });
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
      setIsModalOpen(true);
      toast({
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  // Processing View
  if (isProcessing) {
    return <div className="min-h-screen relative overflow-hidden">
        <OrganicShapes />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <LoadingState />
        </div>
      </div>;
  }

  // Main Single Page
  return <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${backgroundHero})`
    }} />
      <OrganicShapes />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-center p-6 md:p-8">
          <BrandHeader />
        </header>

        {/* Hero + Form */}
        <main className="flex-1 flex flex-col items-center px-6 py-8">
          <div className="w-full max-w-md mx-auto">
            {/* Hero Text */}
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-serene-sand/30 text-secondary text-xs font-medium uppercase tracking-widest mb-4 animate-fade-up">RAIO-X DA MULHER</span>
              <h1 className="font-heading text-3xl md:text-4xl text-primary leading-tight mb-4 animate-fade-up-delay-1">
                Veja o potencial que o seu corpo pode oferecer
              </h1>
              <p className="text-muted-foreground animate-fade-up-delay-2">Preencha os dados abaixo e descubra uma projeção da sua melhor versão baseada em ciência </p>
            </div>

            {/* Form Card */}
            <div className="bg-card rounded-3xl p-8 shadow-soft animate-fade-up-delay-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-serene-sand/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-sm text-muted-foreground">Entender sua individualidade é o primeiro passo</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-primary">
                      Idade
                    </Label>
                    <Input id="age" type="number" placeholder="Ex: 35" value={formData.age} onChange={e => handleFormChange("age", e.target.value)} className="h-12 rounded-xl border-serene-sand focus:border-primary bg-surface" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm font-medium text-primary">
                      Altura (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 165"
                      value={formData.height}
                      onChange={e => handleFormChange("height", e.target.value)}
                      className="h-12 rounded-xl border-serene-sand focus:border-primary bg-surface"
                    />
                    <p className="text-xs text-muted-foreground">
                      Em centímetros. Ex: 165 ou 1.65 (será convertido)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium text-primary">
                    Peso atual (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 75"
                    value={formData.weight}
                    onChange={e => handleFormChange("weight", e.target.value)}
                    className="h-12 rounded-xl border-serene-sand focus:border-primary bg-surface"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite apenas números, sem vírgulas. Ex: 75 ou 75.5
                  </p>
                </div>

                {/* Symptoms Selector */}
                <SymptomsSelector selectedSymptoms={formData.symptoms} onSymptomsChange={symptoms => handleFormChange("symptoms", symptoms)} />

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-primary">
                    Sua foto
                  </Label>
                  <ImageUpload preview={uploadedImage || undefined} onImageSelect={handleImageSelect} onSkip={handleSkipPhotoToggle} skipPhoto={skippedPhoto} onClear={() => {
                  setUploadedImage(null);
                  setUploadedFile(null);
                  setSkippedPhoto(false);
                }} />
                </div>
              </div>

              <Button variant={isFormValid ? "brand-success" : "brand"} size="xl" className="w-full mt-8" onClick={handleOpenModal} disabled={!isFormValid}>
                Acessar o meu raio-x
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 animate-fade-up-delay-3">
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-[#8B6F47]" />
                <p className="text-xs text-muted-foreground">Cuidado</p>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                <p className="text-xs text-muted-foreground">Resultado</p>
              </div>
              <div className="text-center">
                <Dna className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <p className="text-xs text-muted-foreground">Ciência</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={handleLeadSubmit} isLoading={isProcessing} />
    </div>;
}