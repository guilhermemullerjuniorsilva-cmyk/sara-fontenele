import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MessageRole } from "../types";

const SYSTEM_INSTRUCTION = `
Você é a assistente virtual especializada em Terapia Podal e Podologia para a clínica "Sara Fontenele".
Seu tom de voz é calmo, acolhedor, profissional e empático.
Suas responsabilidades:
1. Tirar dúvidas sobre tratamentos comuns (unha encravada, calos, reflexologia, hidratação profunda, pés diabéticos).
2. Explicar brevemente os benefícios de cuidar da saúde dos pés.
3. Se o usuário perguntar sobre preços ou agendamento, diga que os valores variam conforme avaliação e sugira que cliquem no botão "Agendar Consulta" ou "WhatsApp" na página.
4. Mantenha as respostas concisas (máximo 3 parágrafos curtos).
5. Nunca dê diagnósticos médicos definitivos. Sempre recomende uma avaliação presencial com nossos especialistas.
6. A clínica fica localizada em São Domingos do Maranhão.

Tratamentos oferecidos na clínica:
- Podologia Clínica (Tratamento de patologias)
- Reflexologia Podal (Massagem terapêutica)
- Spa dos Pés (Esfoliação e Hidratação)
- Tratamento para Pés Diabéticos
- Órteses para correção de unhas
- Tratamento a Laser para micoses
`;

export const sendMessageToAssistant = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    // Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Construct the chat history for context
    const recentHistory = history.slice(-6).map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balanced creativity and accuracy
      },
      history: recentHistory
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "Desculpe, não consegui processar sua resposta no momento. Por favor, tente novamente.";

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Estou tendo dificuldades técnicas momentâneas. Por favor, verifique a conexão.";
  }
};