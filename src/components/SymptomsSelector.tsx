import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface SymptomsSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

const SYMPTOMS = [
  { id: "falta-energia", label: "Falta de energia" },
  { id: "dor-articular", label: "Dor articular" },
  { id: "inchaco", label: "Inchaço" },
  { id: "constipacao", label: "Constipação" },
  { id: "acne", label: "Acne" },
  { id: "tpm-intensa", label: "TPM intensa" },
  { id: "ciclo-desregulado", label: "Ciclo menstrual desregulado" },
  { id: "oscilacao-humor", label: "Oscilação de humor" },
];

export function SymptomsSelector({ selectedSymptoms, onSymptomsChange }: SymptomsSelectorProps) {
  const handleSymptomToggle = (symptomId: string, checked: boolean) => {
    if (checked) {
      onSymptomsChange([...selectedSymptoms, symptomId]);
    } else {
      onSymptomsChange(selectedSymptoms.filter((s) => s !== symptomId));
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-primary">
        Sintomas que você sente
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {SYMPTOMS.map((symptom) => (
          <div key={symptom.id} className="flex items-center space-x-2">
            <Checkbox
              id={symptom.id}
              checked={selectedSymptoms.includes(symptom.id)}
              onCheckedChange={(checked) => 
                handleSymptomToggle(symptom.id, checked === true)
              }
              className="border-serene-sand data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={symptom.id}
              className="text-sm text-muted-foreground cursor-pointer leading-tight"
            >
              {symptom.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SYMPTOMS };
