import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
} from "firebase/ai";
import { app } from "../remote/firebaseApp";

interface GenerateAITextOptions {
  systemInstruction: string;
  prompt: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  model?: string;
}

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export async function generateAIText({
  systemInstruction,
  prompt,
  temperature,
  topP,
  maxOutputTokens,
  model = DEFAULT_MODEL,
}: GenerateAITextOptions): Promise<string> {
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const generativeModel = getGenerativeModel(ai, {
    model,
    systemInstruction,
    generationConfig: {
      temperature,
      topP,
      maxOutputTokens,
      responseMimeType: "application/json",
    },
  });
  const result = await generativeModel.generateContent(prompt);
  return result.response.text();
}
