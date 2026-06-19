import Groq from "groq-sdk";
import config from "../config";
import { AppError } from "../middlewares/error-handler";

const groq = new Groq({
  apiKey: config.groq.apiKey || process.env.GROQ_API_KEY || "",
});

const SYSTEM_PROMPT = `You are an expert AI Interviewer. You are conducting a highly realistic job interview.
You will be provided with:
- The candidate's target company, role, and experience level.
- The candidate's parsed resume.
- The interview chat history so far.

Your job is to generate the NEXT response as the interviewer.
- If it's the beginning of the interview, greet them and ask the first question.
- If they answered a question, evaluate their answer briefly and naturally, then ask the next question or a follow-up.
- Keep your responses concise and conversational (like a real spoken interview). Do not output long lists or markdown formatting because your text will be converted to speech.
- Act professional but friendly.`;

export const generateNextQuestion = async (
  context: { company: string; role: string; experienceLevel: string; mode: string },
  resumeText: string | null,
  history: { role: "user" | "ai"; content: string }[]
): Promise<string> => {
  if (!config.groq.apiKey && !process.env.GROQ_API_KEY) {
    throw new AppError(500, "Groq API key is missing");
  }

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Context: Target Company: ${context.company}, Role: ${context.role}, Experience: ${context.experienceLevel}. Mode: ${context.mode}.
${resumeText ? `Candidate Resume: ${resumeText}` : "No resume provided."}`
    }
  ];

  history.forEach(msg => {
    messages.push({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content
    });
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 250,
    });

    return chatCompletion.choices[0]?.message?.content || "Could you tell me more about that?";
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw new AppError(500, "Failed to generate AI response");
  }
};
