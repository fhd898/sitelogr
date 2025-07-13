import { PDFDocument } from 'pdf-lib';

export async function makeLogPDF(site: string, summary: string, photos: string[]) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  page.drawText(`Site: ${site}`, { x: 50, y: 780, size: 16 });
  page.drawText(summary, { x: 50, y: 740, size: 12, maxWidth: 495 });
  // Images removed for now
  const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
} 