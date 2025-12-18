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
  const bmiIdeal = 22; // Reference BMI for healthy weight
  const idealWeight = bmiIdeal * (heightInMeters * heightInMeters);

  // WHO BMI classification with more detailed levels
  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-amber-600" };
    if (bmi < 25) return { label: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-600" };
    if (bmi < 35) return { label: "Obesidade grau I", color: "text-orange-600" };
    if (bmi < 40) return { label: "Obesidade grau II", color: "text-red-500" };
    return { label: "Obesidade grau III", color: "text-red-700" };
  };

  const currentClassification = getBMIClassification(bmiCurrent);

  // Calculate healthy weight loss per week (0.5-1kg of fat per week)
  const weeklyWeightLossMin = 0.5;
  const weeklyWeightLossMax = 1.0;

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
            <span className="text-xs uppercase tracking-wider text-muted-foreground">IMC Ideal</span>
          </div>
          <p className="text-3xl font-heading text-primary">{bmiIdeal.toFixed(1)}</p>
          <p className="text-sm font-medium text-green-600">
            Faixa saudável
          </p>
        </div>
      </div>

      {/* Healthy Weight Loss Information */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-secondary" />
          <span className="font-heading text-lg text-primary">Emagrecimento Saudável</span>
        </div>

        <div className="bg-serene-sand/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-secondary leading-relaxed mb-3">
            Considerando sua altura de <strong>{height} cm</strong> e idade de <strong>{age} anos</strong>,
            seu IMC atual é <strong>{bmiCurrent.toFixed(1)}</strong> ({currentClassification.label}).
          </p>
          <p className="text-sm text-secondary leading-relaxed">
            Um peso próximo a <strong>{Math.round(idealWeight)} kg</strong> resultaria em um IMC de <strong>{bmiIdeal}</strong>,
            considerado ideal pela OMS (faixa saudável: 18,5 - 24,9).
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4">
          <h4 className="font-medium text-primary mb-2">Recomendação de Emagrecimento Saudável:</h4>
          <p className="text-sm text-secondary mb-2">
            <strong>{weeklyWeightLossMin}-{weeklyWeightLossMax}kg por semana (de GORDURA)</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Esta é a taxa recomendada para perda de gordura saudável e sustentável, preservando massa muscular e saúde metabólica.
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
