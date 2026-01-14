import mammoth from 'mammoth';
import * as PDFJS from 'pdfjs-dist/webpack.mjs';

// Here we initialize the PDF.js worker
if (typeof window !== 'undefined') {
  PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
}

export async function processFile(file: File): Promise<{ text: string }> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    switch (file.type) {
      // Text-based files
      case 'text/plain':
        const textContent = await file.text();
        return { text: textContent };

      // PDF files
      case 'application/pdf':
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFJS.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          // Extract text from all pages
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item: any) => item.str)
              .join(' ');
            fullText += pageText + '\n';
          }

          return { text: fullText.trim() || `[PDF: ${file.name}]` };
        } catch (pdfError) {
          // console.error('PDF processing error:', pdfError);
          return { text: `[Failed to process PDF: ${file.name}]` };
        }

      // Word documents
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const wordBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: wordBuffer });
        return { text: result.value };

      // Images - just return a placeholder
      case 'image/jpeg':
      case 'image/png':
      case 'image/webp':
        return { text: `[Image: ${file.name}]` };

      // Audio files
      case 'audio/mpeg':
      case 'audio/mp3':
      case 'audio/mp4':
      case 'audio/wav':
      case 'audio/ogg':
        return { text: `[Audio: ${file.name}]` };

      // Video files
      case 'video/mp4':
      case 'video/mpeg':
        return { text: `[Video: ${file.name}]` };

      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    // console.error('File processing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to process file');
  }
}