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
- The recent interview chat history.

Your job is to generate the NEXT response as the interviewer.
- If it's the beginning of the interview, greet them and ask the first question.
- Analyze the candidate's last answer. Intelligently decide whether to ask a deep follow-up question to probe their knowledge, or switch to a new topic based on the remaining interview time.
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

  // Context Optimization (Sliding Window): keep only the last 6 messages
  const windowSize = 6;
  const recentHistory = history.slice(-windowSize);

  recentHistory.forEach(msg => {
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

export const generateFeedbackReport = async (
  context: { company: string; role: string; experienceLevel: string; mode: string },
  resumeText: string | null,
  history: { role: "user" | "ai"; content: string }[]
) => {
  if (!config.groq.apiKey && !process.env.GROQ_API_KEY) {
    throw new AppError(500, "Groq API key is missing");
  }

  const EVALUATION_PROMPT = `You are an expert technical interviewer evaluating a candidate's performance in a mock interview.
Review the following interview transcript and provide a structured scorecard.

Return ONLY a valid JSON object with the following schema:
{
  "overallScore": number (0-100),
  "strengths": string[] (list of 2-4 strengths),
  "weaknesses": string[] (list of 2-4 areas for improvement),
  "recommendation": string (1 paragraph summary of their performance),
  "categories": [
    {
      "name": "Technical Accuracy" | "Communication" | "Problem Solving",
      "score": number (0-100)
    }
  ],
  "questionsFeedback": [
    {
      "userAnswer": string (exact match of the candidate's answer text from the transcript),
      "score": number (0-100),
      "feedback": string (1-2 sentences of feedback on this specific answer)
    }
  ]
}`;

  const messages: any[] = [
    { role: "system", content: EVALUATION_PROMPT },
    {
      role: "system",
      content: `Context: Target Company: ${context.company}, Role: ${context.role}, Experience: ${context.experienceLevel}.
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
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("Groq AI Evaluation Error:", error);
    throw new AppError(500, "Failed to generate AI evaluation");
  }
};
