import { PDFDocument, rgb } from 'pdf-lib';

export async function makeLogPDF(site: string, summary: string, photos: string[]) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  page.drawText(`Site: ${site}`, { x: 50, y: 780, size: 16 });
  page.drawText(summary, { x: 50, y: 740, size: 12, maxWidth: 495 });
  let y = 640;
  for (const url of photos) {
    const imgBytes = await fetch(url).then(r => r.arrayBuffer());
    const img = await pdf.embedJpg(imgBytes);
    page.drawImage(img, { x: 50, y: y - 100, width: 100, height: 100 });
    y -= 120;
  }
  const blob = new Blob([await pdf.save()], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
} 