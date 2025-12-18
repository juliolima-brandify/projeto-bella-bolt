import { Scale, Target, TrendingDown, BookOpen } from "lucide-react";

interface BMIReportProps {
  weight: number;
  height: number;
  goalWeight: number;
  age: number;
}

export function BMIReport({ weight, height, goalWeight, age }: BMIReportProps) {
  const heightInMeters = height / 100;
  
  // Calculate BMI
  const bmiCurrent = weight / (heightInMeters * heightInMeters);
  const bmiGoal = goalWeight / (heightInMeters * heightInMeters);
  
  // Calculate ideal weight using Devine formula for women
  const heightInInches = height / 2.54;
  const idealWeightDevine = 45.5 + 2.3 * ((heightInInches - 60) > 0 ? (heightInInches - 60) : 0);
  
  // WHO BMI classification
  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-amber-600" };
    if (bmi < 25) return { label: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-600" };
    return { label: "Obesidade", color: "text-red-600" };
  };

  const currentClassification = getBMIClassification(bmiCurrent);
  const goalClassification = getBMIClassification(bmiGoal);

  return (
    <div className="space-y-6">
      {/* BMI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-secondary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">IMC Atual</span>
          </div>
          <p className="text-3xl font-heading text-primary">{bmiCurrent.toFixed(1)}</p>
          <p className={`text-sm font-medium ${currentClassification.color}`}>
            {currentClassification.label}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-secondary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">IMC Meta</span>
          </div>
          <p className="text-3xl font-heading text-primary">{bmiGoal.toFixed(1)}</p>
          <p className={`text-sm font-medium ${goalClassification.color}`}>
            {goalClassification.label}
          </p>
        </div>
      </div>

      {/* Weight Summary */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-secondary" />
          <span className="font-heading text-lg text-primary">Análise de Peso</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <p className="text-2xl font-heading text-primary">{weight} kg</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Atual</p>
          </div>
          <div className="border-x border-serene-sand/50">
            <p className="text-2xl font-heading text-primary">{goalWeight} kg</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Meta</p>
          </div>
          <div>
            <p className="text-2xl font-heading text-primary">{Math.round(idealWeightDevine)} kg</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ideal*</p>
          </div>
        </div>

        <div className="bg-serene-sand/20 rounded-xl p-4">
          <p className="text-sm text-secondary leading-relaxed">
            Considerando sua altura de <strong>{height} cm</strong> e idade de <strong>{age} anos</strong>, 
            sua meta de peso de <strong>{goalWeight} kg</strong> resultaria em um IMC de <strong>{bmiGoal.toFixed(1)}</strong>, 
            que está {bmiGoal >= 18.5 && bmiGoal < 25 ? "dentro" : "fora"} da faixa considerada saudável pela OMS (18,5 - 24,9).
          </p>
        </div>
      </div>

      {/* Scientific References */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-secondary" />
          <span className="font-heading text-lg text-primary">Base Científica</span>
        </div>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            O Índice de Massa Corporal (IMC) é uma medida internacional usada para calcular se uma pessoa está 
            no peso ideal. A fórmula é: <strong>IMC = peso (kg) ÷ altura² (m)</strong>.
          </p>
          
          <div className="bg-serene-sand/20 rounded-xl p-4">
            <p className="font-medium text-primary mb-2">Classificação OMS:</p>
            <ul className="space-y-1">
              <li>• Abaixo do peso: IMC &lt; 18,5</li>
              <li>• Peso normal: IMC 18,5 - 24,9</li>
              <li>• Sobrepeso: IMC 25 - 29,9</li>
              <li>• Obesidade: IMC ≥ 30</li>
            </ul>
          </div>
          
          <p className="text-xs italic">
            * O peso ideal é calculado usando a fórmula de Devine (1974), amplamente utilizada em estudos clínicos. 
            Para mulheres: 45,5 kg + 2,3 kg para cada polegada acima de 5 pés.
          </p>
          
          <p className="text-xs">
            <strong>Fontes:</strong> World Health Organization (OMS), 2000. Obesity: preventing and managing the global epidemic. 
            Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974.
          </p>
        </div>
      </div>
    </div>
  );
}
