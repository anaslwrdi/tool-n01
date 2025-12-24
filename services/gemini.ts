
import { GoogleGenAI, Type } from "@google/genai";
import { FileMetadata } from '../types';

export interface GeminiAnalysis {
  sensitiveData: string[];
  recommendations: string[];
  deviceInfo?: string;
  locationInfo?: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  suggestedFakeMetadata?: {
    device?: string;
    location?: string;
    creationDate?: string;
    cameraModel?: string;
  };
}

export class GeminiService {
  private static instance: GeminiService;
  private ai: GoogleGenAI;

  private constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async analyzeFile(file: File): Promise<GeminiAnalysis> {
    try {
      const prompt = `
        أنا محلل خصوصية للملفات الرقمية. قم بتحليل ملف ${file.type.startsWith('image/') ? 'صورة' : 'فيديو'} من أجل:
        1. اكتشاف البيانات الحساسة المحتملة في اسم الملف أو سمات البيانات الوصفية العامة.
        2. تحديد مستوى الخطورة (low, medium, high).
        3. تقديم توصيات أمنية باللغة العربية.
        4. اقتراح بيانات وهمية مقنعة للتمويه (جهاز عشوائي، موقع عشوائي، تاريخ عشوائي).

        معلومات الملف:
        - الاسم: ${file.name}
        - النوع: ${file.type}
        - الحجم: ${Math.round(file.size / 1024 / 1024)} MB
        - آخر تعديل: ${new Date(file.lastModified).toISOString()}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sensitiveData: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskLevel: { type: Type.STRING, description: "low, medium, or high" },
              confidence: { type: Type.NUMBER },
              deviceInfo: { type: Type.STRING },
              locationInfo: { type: Type.STRING },
              suggestedFakeMetadata: {
                type: Type.OBJECT,
                properties: {
                  device: { type: Type.STRING },
                  location: { type: Type.STRING },
                  creationDate: { type: Type.STRING }
                }
              }
            },
            required: ["sensitiveData", "recommendations", "riskLevel", "confidence"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('No AI response text');
      return JSON.parse(text) as GeminiAnalysis;
    } catch (error) {
      console.warn('Gemini analysis failed, using fallback simulation:', error);
      return this.simulateAnalysis(file);
    }
  }

  private simulateAnalysis(file: File): GeminiAnalysis {
    const isImage = file.type.startsWith('image/');
    return {
      sensitiveData: ["بصمة اسم الملف تحتوي على أرقام قد تدل على التاريخ", isImage ? "احتمالية وجود بيانات EXIF" : "بيانات الحاوية التقنية"],
      recommendations: ["إزالة البيانات الوصفية فوراً", "تغيير اسم الملف ليكون عشوائياً", "استخدام التمويه الجغرافي"],
      riskLevel: "medium",
      confidence: 0.7,
      suggestedFakeMetadata: {
        device: "iPhone 14 Pro",
        location: "Stockholm, Sweden",
        creationDate: new Date(Date.now() - 31536000000).toISOString()
      }
    };
  }

  async generateFakeMetadata(): Promise<Partial<FileMetadata>> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate realistic but completely synthetic digital hardware and environment metadata to mask original identity.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              device: { type: Type.STRING },
              location: { type: Type.STRING },
              creationDate: { type: Type.STRING },
              technicalData: {
                type: Type.OBJECT,
                properties: {
                  software: { type: Type.STRING },
                  colorProfile: { type: Type.STRING },
                  lens: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      const text = response.text;
      if (!text) return {};
      const parsed = JSON.parse(text);
      return {
        device: parsed.device,
        location: parsed.location,
        creationDate: parsed.creationDate,
        technicalData: parsed.technicalData,
        generatedFakeData: true
      };
    } catch (error) {
      console.warn("AI fake data generation failed, using static decoy");
      return {
        device: "Shielded Forensic Hardware",
        location: "Protected Network",
        generatedFakeData: true
      };
    }
  }
}

export const getGeminiService = (): GeminiService => {
  return GeminiService.getInstance();
};
