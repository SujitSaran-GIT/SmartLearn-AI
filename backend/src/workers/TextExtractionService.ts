// src/services/TextExtractionService.ts
import axios from 'axios';
import pdfParse = require('pdf-parse');

export class TextExtractionService {
  async extractTextFromUrl(fileUrl: string): Promise<string> {
    try {
      const response = await axios.get<ArrayBuffer>(fileUrl, {
        responseType: 'arraybuffer',
      });

      const data = await pdfParse(Buffer.from(response.data));
      return data.text;
    } catch (error) {
      console.error('Text extraction from URL error:', error);
      throw new Error('Failed to extract text from PDF URL');
    }
  }

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Text extraction from buffer error:', error);
      throw new Error('Failed to extract text from PDF buffer');
    }
  }
}
