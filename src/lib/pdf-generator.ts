import { jsPDF } from 'jspdf';

interface ReportData {
  name: string;
  weight: number;
  height: number;
  age: number;
  bmiCurrent: number;
  tmb: number;
  symptoms: string[];
  originalImage?: string | null;
  transformedImage?: string | null;
}

export async function generatePDF(reportData: ReportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header with Brand
  pdf.setFillColor(54, 45, 40); // Primary color
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(230, 227, 220); // Light text
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dra. Izabella Brasão', pageWidth / 2, 15, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Obesidade | Emagrecimento | Saúde hormonal', pageWidth / 2, 22, { align: 'center' });

  pdf.setFontSize(9);
  pdf.text('CRM/MG 106624', pageWidth / 2, 28, { align: 'center' });

  yPosition = 50;
  pdf.setTextColor(54, 45, 40);

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Raio-X da Mulher', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Relatório de ${reportData.name}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Patient Info Box
  pdf.setFillColor(246, 244, 241);
  pdf.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, 'F');
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dados da Paciente:', 20, yPosition);
  yPosition += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Idade: ${reportData.age} anos`, 20, yPosition);
  pdf.text(`Peso: ${reportData.weight} kg`, 80, yPosition);
  pdf.text(`Altura: ${reportData.height} cm`, 140, yPosition);
  yPosition += 6;

  pdf.text(`IMC Atual: ${reportData.bmiCurrent.toFixed(1)}`, 20, yPosition);
  pdf.text(`TMB: ${Math.round(reportData.tmb)} kcal/dia`, 80, yPosition);
  yPosition += 20;

  // Images section (if available)
  if (reportData.originalImage && reportData.transformedImage) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Projeção Visual', 20, yPosition);
    yPosition += 8;

    const imgWidth = 60;
    const imgHeight = 80;
    const spacing = 10;
    const startX = (pageWidth - (imgWidth * 2 + spacing)) / 2;

    try {
      // Before image
      pdf.addImage(reportData.originalImage, 'JPEG', startX, yPosition, imgWidth, imgHeight);
      pdf.setFontSize(9);
      pdf.text('Atual', startX + imgWidth / 2, yPosition + imgHeight + 5, { align: 'center' });

      // After image
      pdf.addImage(reportData.transformedImage, 'JPEG', startX + imgWidth + spacing, yPosition, imgWidth, imgHeight);
      pdf.text('Projeção', startX + imgWidth + spacing + imgWidth / 2, yPosition + imgHeight + 5, { align: 'center' });

      yPosition += imgHeight + 15;
    } catch (error) {
      console.error('Error adding images to PDF:', error);
      yPosition += 10;
    }
  }

  // Add new page for more content
  pdf.addPage();
  yPosition = 20;

  // BMI Classification
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Análise de IMC', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const heightInMeters = reportData.height / 100;
  const idealWeight = 22 * (heightInMeters * heightInMeters);

  const lines = [
    `Seu IMC atual é ${reportData.bmiCurrent.toFixed(1)}.`,
    `Um peso próximo a ${Math.round(idealWeight)} kg resultaria em um IMC ideal de 22.`,
    '',
    'Recomendação de Emagrecimento Saudável:',
    '• 0,5-1kg por semana (de GORDURA)',
    '• Esta é a taxa recomendada para perda de gordura saudável',
    '• Preserva massa muscular e saúde metabólica'
  ];

  lines.forEach(line => {
    pdf.text(line, 20, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Symptoms section
  if (reportData.symptoms && reportData.symptoms.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sintomas Reportados', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    reportData.symptoms.forEach((symptom) => {
      pdf.text(`• ${symptom}`, 25, yPosition);
      yPosition += 6;
    });
  }

  // Footer with contact info
  const footerY = pageHeight - 40;
  pdf.setFillColor(54, 45, 40);
  pdf.rect(0, footerY, pageWidth, 40, 'F');

  pdf.setTextColor(230, 227, 220);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dra. Izabella Brasão', pageWidth / 2, footerY + 8, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Clínica Lumini - Araguari/MG', pageWidth / 2, footerY + 14, { align: 'center' });
  pdf.text('Av. Cel. Teodolino Pereira Araújo, 1015 - Centro', pageWidth / 2, footerY + 19, { align: 'center' });
  pdf.text('Instagram: @bellabrasao', pageWidth / 2, footerY + 24, { align: 'center' });

  pdf.setFontSize(7);
  pdf.text('WhatsApp: (34) 9 9999-9999', pageWidth / 2, footerY + 30, { align: 'center' });

  // Save PDF
  pdf.save(`raio-x-${reportData.name.split(' ')[0]}.pdf`);
}
