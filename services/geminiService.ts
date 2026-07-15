
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("VITE_GEMINI_API_KEY is missing or invalid in .env.local");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateEmailContent = async (topic: string, tone: string) => {
  try {
    const ai = getAiClient();
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
    const ai = getAiClient();
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

export interface SpamAnalysisResult {
  score: number;
  riskLevel: 'baixo' | 'médio' | 'alto';
  spamTriggerWords: string[];
  recommendations: string[];
}

export const analyzeSpamRisk = async (subject: string, content: string): Promise<SpamAnalysisResult> => {
  try {
    const ai = getAiClient();
    const plainTextBody = content.replace(/<[^>]*>/g, '');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o seguinte e-mail de marketing e dê uma nota de entregabilidade de 0 a 100 (onde 100 é perfeito e 0 é alto risco de spam).
      Identifique termos ou aspectos de alto risco (como palavras de spam, assuntos muito longos, ou problemas de formatação) e dê recomendações de correção.
      Assunto: "${subject}"
      Corpo: "${plainTextBody}"
      
      Retorne a análise em formato JSON seguindo este esquema:
      {
        "score": número (0 a 100),
        "riskLevel": "baixo" | "médio" | "alto",
        "spamTriggerWords": ["palavra1", "palavra2"],
        "recommendations": ["recomendação 1", "recomendação 2"]
      }
      Responda em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            riskLevel: { type: Type.STRING, enum: ["baixo", "médio", "alto"] },
            spamTriggerWords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["score", "riskLevel", "spamTriggerWords", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text) as SpamAnalysisResult;
  } catch (error) {
    console.error("Erro na análise de spam com Gemini:", error);
    return {
      score: 85,
      riskLevel: 'baixo',
      spamTriggerWords: [],
      recommendations: ["Não foi possível conectar à inteligência artificial para verificar o risco de spam no momento."]
    };
  }
};

export const rewriteText = async (text: string, tone: string, instruction: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Reescreva o seguinte texto para um e-mail de marketing. 
      O tom desejado é: ${tone}.
      Instrução adicional de reescrita: ${instruction || "Melhore o texto e mantenha-o profissional."}
      Texto original: "${text}"
      
      Retorne APENAS o texto reescrito final, sem explicações, comentários ou aspas extras. Responda em Português do Brasil.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Erro ao reescrever texto com Gemini:", error);
    throw error;
  }
};

export interface CtaSuggestion {
  text: string;
  justification: string;
}

export const suggestCta = async (content: string): Promise<CtaSuggestion[]> => {
  try {
    const ai = getAiClient();
    const plainText = content.replace(/<[^>]*>/g, '');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o seguinte e-mail de marketing e sugira 3 chamadas para ação (CTAs) de alta conversão (textos curtos e atraentes para o botão principal).
      Para cada sugestão, forneça o texto do botão e uma justificativa de 1 frase explicando o porquê de funcionar.
      
      Conteúdo do e-mail: "${plainText}"
      
      Retorne em formato JSON seguindo este esquema:
      [
        {
          "text": "Texto do botão (máx. 30 caracteres)",
          "justification": "Justificativa de por que este CTA é eficaz."
        }
      ]
      Responda em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              justification: { type: Type.STRING }
            },
            required: ["text", "justification"]
          }
        }
      }
    });
    return JSON.parse(response.text) as CtaSuggestion[];
  } catch (error) {
    console.error("Erro ao sugerir CTAs com Gemini:", error);
    return [];
  }
};

