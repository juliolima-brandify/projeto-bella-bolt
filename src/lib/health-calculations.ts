// BMI Calculation
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// Get BMI classification based on WHO standards
export function getBMIClassification(bmi: number): {
  label: string;
  color: string;
  description: string;
} {
  if (bmi < 18.5) {
    return {
      label: "Abaixo do peso",
      color: "text-amber-600",
      description: "IMC abaixo do recomendado pela OMS",
    };
  } else if (bmi < 25) {
    return {
      label: "Peso normal",
      color: "text-green-600",
      description: "IMC dentro da faixa saudável",
    };
  } else if (bmi < 30) {
    return {
      label: "Sobrepeso",
      color: "text-amber-600",
      description: "IMC acima do recomendado",
    };
  } else if (bmi < 35) {
    return {
      label: "Obesidade grau I",
      color: "text-orange-600",
      description: "Risco moderado para a saúde",
    };
  } else if (bmi < 40) {
    return {
      label: "Obesidade grau II",
      color: "text-red-500",
      description: "Risco alto para a saúde",
    };
  } else {
    return {
      label: "Obesidade grau III",
      color: "text-red-700",
      description: "Risco muito alto para a saúde",
    };
  }
}

// Calculate ideal weight for BMI 22 (middle of healthy range)
export function calculateIdealWeight(heightCm: number): number {
  const heightM = heightCm / 100;
  return 22 * (heightM * heightM);
}

// Calculate TMB (Taxa Metabólica Basal) using Mifflin-St Jeor equation for women
export function calculateTMB(weightKg: number, heightCm: number, age: number): number {
  // Mifflin-St Jeor for women: (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 161
  return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
}

// Symptom orientations
export const SYMPTOM_ORIENTATIONS: Record<string, { title: string; tip: string }> = {
  "falta-energia": {
    title: "Falta de Energia",
    tip: "A fadiga pode estar relacionada à qualidade do sono, níveis de ferro ou disfunção tireoidiana. Uma avaliação metabólica pode identificar a causa.",
  },
  "dor-articular": {
    title: "Dor Articular",
    tip: "O excesso de peso aumenta a carga nas articulações. A perda de peso alivia significativamente dores em joelhos e quadris.",
  },
  "inchaco": {
    title: "Inchaço",
    tip: "Pode indicar retenção hídrica, sensibilidade alimentar ou desequilíbrio hormonal. Ajustes na alimentação costumam trazer alívio rápido.",
  },
  "constipacao": {
    title: "Constipação",
    tip: "Relacionada à hidratação, fibras e saúde intestinal. Uma dieta balanceada melhora significativamente o trânsito intestinal.",
  },
  "acne": {
    title: "Acne",
    tip: "Frequentemente ligada a resistência insulínica e desequilíbrios hormonais. Mudanças na alimentação podem melhorar a pele.",
  },
  "tpm-intensa": {
    title: "TPM Intensa",
    tip: "Os sintomas pré-menstruais podem ser amenizados com equilíbrio hormonal, controle de estresse e nutrição adequada.",
  },
  "ciclo-desregulado": {
    title: "Ciclo Menstrual Desregulado",
    tip: "Irregularidades podem indicar síndrome dos ovários policísticos ou disfunção tireoidiana. Avaliação médica é recomendada.",
  },
  "oscilacao-humor": {
    title: "Oscilação de Humor",
    tip: "Mudanças de humor podem estar relacionadas a flutuações hormonais, resistência à insulina ou deficiências nutricionais. Equilibrar a alimentação e o sono ajuda a estabilizar o humor.",
  },
};
