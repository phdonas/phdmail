
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateEmailContent = async (topic: string, tone: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva um e-mail de marketing convincente sobre: ${topic}. O tom deve ser ${tone}. Inclua um assunto e o corpo do e-mail. Retorne em formato JSON. Responda em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ["subject", "body"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    throw error;
  }
};

export const suggestSubjectLines = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugira 5 linhas de assunto de e-mail de alta conversão para uma campanha sobre: ${topic}. Retorne como um array de strings. Responda em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao sugerir assuntos:", error);
    return [];
  }
};
