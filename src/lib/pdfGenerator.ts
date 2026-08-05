import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function sanitizeOklchColors(doc: Document) {
  const allElements = doc.querySelectorAll<HTMLElement>('*');
  allElements.forEach((el) => {
    try {
      const computed = doc.defaultView?.getComputedStyle(el);
      if (!computed) return;

      const props: (keyof CSSStyleDeclaration)[] = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'outlineColor',
        'fill',
        'stroke',
      ];

      props.forEach((prop) => {
        const val = computed[prop] as string;
        if (typeof val === 'string' && val.includes('oklch')) {
          const temp = doc.createElement('span');
          temp.style.color = val;
          doc.body.appendChild(temp);
          const rgbVal = doc.defaultView?.getComputedStyle(temp).color;
          doc.body.removeChild(temp);

          if (rgbVal && !rgbVal.includes('oklch')) {
            (el.style as unknown as Record<string, string>)[prop as string] = rgbVal;
          } else {
            (el.style as unknown as Record<string, string>)[prop as string] = '#000000';
          }
        }
      });
    } catch {
      // ignore
    }
  });
}

export async function generateBaremaPDF(element: HTMLElement): Promise<{ pdfBlob: Blob; pdfBase64: string }> {
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution canvas rendering
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc) => {
      sanitizeOklchColors(clonedDoc);
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  const pdfArrayBuffer = pdf.output('arraybuffer');
  const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  const pdfBase64 = pdf.output('datauristring').split(',')[1];

  return { pdfBlob, pdfBase64 };
}

