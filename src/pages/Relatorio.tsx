import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Download, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/BrandHeader";
import { OrganicShapes } from "@/components/OrganicShapes";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { BMIReport } from "@/components/BMIReport";
import { VideoEmbed } from "@/components/VideoEmbed";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WhatsAppPopup } from "@/components/WhatsAppPopup";
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
  originalImage: string | null;
  transformedImage: string | null;
  hasPhoto?: boolean;
}

export default function Relatorio() {
  const location = useLocation();
  const navigate = useNavigate();
  const aulaRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  const [videoWatchTime, setVideoWatchTime] = useState(0);

  // Get data from navigation state
  const reportData = location.state as ReportData | null;

  useEffect(() => {
    // Hide confetti after a few seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show WhatsApp button after 3 minutes of viewing time
    const timer = setInterval(() => {
      setVideoWatchTime(prev => {
        const newTime = prev + 1;
        if (newTime >= 180) { // 3 minutes = 180 seconds
          setShowWhatsAppButton(true);
          clearInterval(timer);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
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
    if (!reportData.transformedImage) return;
    const link = document.createElement("a");
    link.href = reportData.transformedImage;
    link.download = `raio-x-${reportData.name.split(" ")[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasPhoto = reportData.hasPhoto && reportData.originalImage && reportData.transformedImage;

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
            <BrandHeader />
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

        {/* Image Comparison Section - Only show if photo exists */}
        {hasPhoto && (
          <section className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              {/* Side by side view only */}
              <div className="animate-fade-up-delay-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <img
                      src={reportData.originalImage!}
                      alt="Foto atual"
                      className="w-full rounded-2xl shadow-soft object-cover aspect-[3/4]"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium text-primary">
                      IMC {reportData.bmiCurrent.toFixed(1)}
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={reportData.transformedImage!}
                      alt="Projeção ideal"
                      className="w-full rounded-2xl shadow-soft object-cover aspect-[3/4]"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-sm font-medium text-primary-foreground">
                      IMC 22
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BMI and Data Section - Always show */}
        <section className="px-6 pb-12">
          <div className="max-w-3xl mx-auto">
            {/* BMI Report */}
            <div className="mb-8 animate-fade-up-delay-3">
              <BMIReport
                weight={reportData.weight}
                height={reportData.height}
                goalWeight={reportData.goalWeight}
                age={reportData.age}
              />
            </div>

            {/* TMB Section */}
            <div className="mb-6 p-6 bg-card rounded-2xl shadow-soft animate-fade-up-delay-3">
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
              <div className="mb-6 animate-fade-up-delay-3">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="brand"
                size="xl"
                className="flex-1"
                onClick={scrollToAula}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Assistir à Aula
              </Button>
              {hasPhoto && (
                <Button
                  variant="brand-outline"
                  size="xl"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Salvar Imagem
                </Button>
              )}
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
                Aula exclusiva com a Dra Izabella Brasão
              </h2>
              <h3 className="font-heading text-xl text-secondary mb-2">
                Tudo o que você precisa antes de emagrecer
              </h3>
              <p className="text-muted-foreground">
                Em alguns minutos você vai entender o que nunca compreendeu sobre o seu corpo
              </p>
            </div>

            <VideoEmbed
              videoUrl=""
              title="Aula com Dra. Izabella Brasão"
            />

            {/* WhatsApp CTA that appears after 3 minutes */}
            {showWhatsAppButton && (
              <div className="mt-8 text-center animate-fade-up">
                <WhatsAppButton />
              </div>
            )}

            {/* Final CTA */}
            <div className="mt-12 text-center">
              <h3 className="font-heading text-xl text-primary mb-4">
                Pronta para dar o próximo passo?
              </h3>
              <p className="text-muted-foreground mb-6">
                Construindo o seu futuro, com você.
              </p>
              {!showWhatsAppButton && (
                <WhatsAppButton />
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="px-6 py-16 bg-surface">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl text-primary text-center mb-8">
              Quem é a Dra. Izabella Brasão
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-secondary leading-relaxed mb-6">
                Uma mulher que acredita que nenhuma outra mulher deveria passar a vida em guerra com o próprio corpo.
                Médica, esposa e cristã. Pós-graduanda em Obesidade e Emagrecimento pelo Hospital Israelita Albert Einstein
                e em Endocrinologia e Ginecologia Clínica.
              </p>

              <p className="text-secondary leading-relaxed mb-6">
                Atualmente cursa sua segunda graduação — Nutrição — porque acredita que entender o corpo humano é um
                trabalho que não termina. Casada com Fernando Brasão, com quem vive seu primeiro e maior ministério: a família.
              </p>

              <p className="text-secondary leading-relaxed mb-6">
                Apaixonada por ajudar mulheres a entenderem seus corpos sem culpa e sem terrorismo, criou o <strong>Método B</strong>
                e a <strong>Comunidade O Lado B</strong> com um único propósito: mostrar o caminho certo para mulheres que cansaram
                de tentar de tudo e estão prontas para se tornarem especialistas em si mesmas.
              </p>

              <div className="flex items-start gap-3 mt-8 p-6 bg-card rounded-2xl shadow-soft">
                <MapPin className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg text-primary mb-2">Clínica Lumini</h3>
                  <p className="text-secondary">
                    Av. Cel. Teodolino Pereira Araújo, 1015 - Centro
                    <br />
                    <strong>Araguari/MG</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="px-6 py-8 text-center bg-serene-sand/10">
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Esta visualização é uma projeção ilustrativa baseada em inteligência
            artificial e não constitui diagnóstico médico. Resultados individuais
            variam conforme fatores biológicos e acompanhamento profissional.
          </p>
        </footer>
      </div>

      {/* WhatsApp Popup */}
      <WhatsAppPopup />
    </div>
  );
}
