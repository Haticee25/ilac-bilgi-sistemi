import { useCallback } from 'react';
import Tesseract from 'tesseract.js';

export const useOCR = () => {
  const scanImage = useCallback(async (imageData: string) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageData, 'tur+eng');
      return text;
    } catch (err) {
      console.error("OCR hatası:", err);
      return null;
    }
  }, []);

  // Buradaki ismin scanImage olduğundan emin oluyoruz
  return { scanImage }; 
};