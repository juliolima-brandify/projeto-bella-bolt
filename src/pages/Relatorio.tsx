import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Calendar, Download, CheckCircle, Columns, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoBella from "@/assets/logo-bella.png";
import { OrganicShapes } from "@/components/OrganicShapes";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { BMIReport } from "@/components/BMIReport";
import { VideoEmbed } from "@/components/VideoEmbed";
import { SYMPTOM_ORIENTATIONS, getBMIClassification } from "@/lib/health-calculations";

interface ReportData {
  name: string;
  weight: number;
  height: number;
  goalWeight: number;
  age: number;
  bmiCurrent: number;
  tmb: number;
  symptoms: string[];
  originalImage: string;
  transformedImage: string;
}

type ViewMode = "slider" | "side-by-side" | "separate";

export default function Relatorio() {
  const location = useLocation();
  const navigate = useNavigate();
  const aulaRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("slider");

  // Get data from navigation state
  const reportData = location.state as ReportData | null;

  useEffect(() => {
    // Hide confetti after a few seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if no data
  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-primary mb-4">
            Relatório não encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            Parece que você acessou esta página diretamente.
          </p>
          <Button variant="brand" onClick={() => navigate("/")}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const scrollToAula = () => {
    aulaRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = reportData.transformedImage;
    link.download = `vision-body-${reportData.name.split(" ")[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bmiClassification = getBMIClassification(reportData.bmiCurrent);
  const selectedSymptoms = reportData.symptoms || [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <OrganicShapes />

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-center p-6 md:p-8">
          <button
            onClick={() => navigate("/")}
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src={logoBella} 
              alt="Dra. Izabella Brasão - Obesidade & Emagrecimento" 
              className="h-8 md:h-10 object-contain"
            />
          </button>
        </header>

        {/* Thank You Section */}
        <section className="px-6 py-12 text-center">
          <div className="max-w-2xl mx-auto">
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 40}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random()}s`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: ["#362D28", "#6F6356", "#ABA597", "#E6E3DC"][
                          Math.floor(Math.random() * 4)
                        ],
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6 animate-fade-up">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4 animate-fade-up-delay-1">
              Parabéns, {reportData.name.split(" ")[0]}!
            </h1>

            <p className="text-lg text-muted-foreground animate-fade-up-delay-2">
              Seu relatório personalizado está pronto. Veja abaixo a projeção do
              potencial que o seu corpo pode oferecer.
            </p>
          </div>
        </section>

        {/* Image Comparison Section */}
        <section className="px-6 pb-12">
          <div className="max-w-3xl mx-auto">
            {/* View Mode Toggle */}
            <div className="flex justify-center gap-2 mb-6 animate-fade-up-delay-2">
              <Button
                variant={viewMode === "slider" ? "brand" : "brand-outline"}
                size="sm"
                onClick={() => setViewMode("slider")}
              >
                Comparar
              </Button>
              <Button
                variant={viewMode === "side-by-side" ? "brand" : "brand-outline"}
                size="sm"
                onClick={() => setViewMode("side-by-side")}
              >
                <Columns className="w-4 h-4 mr-1" />
                Lado a lado
              </Button>
              <Button
                variant={viewMode === "separate" ? "brand" : "brand-outline"}
                size="sm"
                onClick={() => setViewMode("separate")}
              >
                <Square className="w-4 h-4 mr-1" />
                Separadas
              </Button>
            </div>

            {/* Image Display based on view mode */}
            <div className="animate-fade-up-delay-2">
              {viewMode === "slider" && (
                <BeforeAfterSlider
                  beforeImage={reportData.originalImage}
                  afterImage={reportData.transformedImage}
                  beforeLabel={`IMC ${reportData.bmiCurrent.toFixed(1)}`}
                  afterLabel="IMC 22"
                />
              )}

              {viewMode === "side-by-side" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <img
                      src={reportData.originalImage}
                      alt="Foto atual"
                      className="w-full rounded-2xl shadow-soft object-cover aspect-[3/4]"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium text-primary">
                      IMC {reportData.bmiCurrent.toFixed(1)}
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={reportData.transformedImage}
                      alt="Projeção ideal"
                      className="w-full rounded-2xl shadow-soft object-cover aspect-[3/4]"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-sm font-medium text-primary-foreground">
                      IMC 22
                    </div>
                  </div>
                </div>
              )}

              {viewMode === "separate" && (
                <div className="space-y-6">
                  <div className="relative">
                    <p className="text-sm font-medium text-primary mb-2 text-center">Atual - IMC {reportData.bmiCurrent.toFixed(1)} ({bmiClassification.label})</p>
                    <img
                      src={reportData.originalImage}
                      alt="Foto atual"
                      className="w-full max-w-md mx-auto rounded-2xl shadow-soft object-cover aspect-[3/4]"
                    />
                  </div>
                  <div className="relative">
                    <p className="text-sm font-medium text-primary mb-2 text-center">Projeção - IMC 22 (Peso ideal)</p>
                    <img
                      src={reportData.transformedImage}
                      alt="Projeção ideal"
                      className="w-full max-w-md mx-auto rounded-2xl shadow-soft object-cover aspect-[3/4]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BMI Report */}
            <div className="mt-8 animate-fade-up-delay-3">
              <BMIReport
                weight={reportData.weight}
                height={reportData.height}
                goalWeight={reportData.goalWeight}
                age={reportData.age}
              />
            </div>

            {/* TMB Section */}
            <div className="mt-6 p-6 bg-card rounded-2xl shadow-soft animate-fade-up-delay-3">
              <h3 className="font-heading text-lg text-primary mb-2">
                Taxa Metabólica Basal (TMB)
              </h3>
              <p className="text-2xl font-semibold text-secondary mb-2">
                {Math.round(reportData.tmb)} kcal/dia
              </p>
              <p className="text-sm text-muted-foreground">
                Quantidade de calorias que seu corpo precisa em repouso para manter funções vitais. 
                Este valor é calculado pela fórmula de Mifflin-St Jeor.
              </p>
            </div>

            {/* Symptoms Orientations */}
            {selectedSymptoms.length > 0 && (
              <div className="mt-6 animate-fade-up-delay-3">
                <h3 className="font-heading text-xl text-primary mb-4">
                  Orientações para seus sintomas
                </h3>
                <div className="space-y-4">
                  {selectedSymptoms.map((symptomId) => {
                    const orientation = SYMPTOM_ORIENTATIONS[symptomId];
                    if (!orientation) return null;
                    return (
                      <div
                        key={symptomId}
                        className="p-4 bg-card rounded-xl shadow-soft border-l-4 border-secondary"
                      >
                        <h4 className="font-medium text-primary mb-1">
                          {orientation.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {orientation.tip}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                variant="brand"
                size="xl"
                className="flex-1"
                onClick={scrollToAula}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Assistir à Aula
              </Button>
              <Button
                variant="brand-outline"
                size="xl"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Salvar Imagem
              </Button>
            </div>
          </div>
        </section>

        {/* Aula Section */}
        <section ref={aulaRef} className="px-6 py-16 bg-serene-sand/20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-serene-sand/30 text-secondary text-xs font-medium uppercase tracking-widest mb-4">
                Aula Exclusiva
              </span>
              <h2 className="font-heading text-2xl md:text-3xl text-primary mb-4">
                Entenda como alcançar seus objetivos
              </h2>
              <p className="text-muted-foreground">
                A Dra. Izabella preparou um conteúdo especial para você
              </p>
            </div>

            <VideoEmbed
              videoUrl=""
              title="Aula com Dra. Izabella Brasão"
            />

            {/* Final CTA */}
            <div className="mt-12 text-center">
              <h3 className="font-heading text-xl text-primary mb-4">
                Pronta para dar o próximo passo?
              </h3>
              <p className="text-muted-foreground mb-6">
                Construindo o seu futuro, com você.
              </p>
              <Button
                variant="brand"
                size="xl"
                onClick={() =>
                  window.open(
                    "https://wa.me/5511999999999?text=Olá! Fiz a simulação Vision Body e gostaria de agendar uma consulta.",
                    "_blank"
                  )
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            </div>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="px-6 py-8 text-center">
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Esta visualização é uma projeção ilustrativa baseada em inteligência
            artificial e não constitui diagnóstico médico. Resultados individuais
            variam conforme fatores biológicos e acompanhamento profissional.
          </p>
        </footer>
      </div>
    </div>
  );
}
