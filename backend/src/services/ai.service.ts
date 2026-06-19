import Groq from "groq-sdk";
import config from "../config";

const groq = new Groq({
  apiKey: config.groq.apiKey,
});

/**
 * Generates a contextual interview question using Groq LLM.
 */
export async function generateInterviewQuestion(params: {
  company: string;
  role: string;
  experience: string;
  previousMessages: { role: string; content: string }[];
  questionIndex: number;
}) {
  const systemPrompt = `You are a senior interviewer at ${params.company} conducting a mock interview for a ${params.experience} ${params.role} position.

Rules:
- Ask one question at a time.
- Start with behavioral, move to technical, then system design.
- Adjust difficulty based on the candidate's experience level.
- Be encouraging but professional.
- This is question ${params.questionIndex + 1} of the interview.`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...params.previousMessages.map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || "Could not generate question.";
}

/**
 * Evaluates a candidate's answer and returns structured feedback.
 */
export async function evaluateAnswer(params: {
  company: string;
  role: string;
  question: string;
  answer: string;
}) {
  const systemPrompt = `You are evaluating a candidate's answer for a ${params.role} position at ${params.company}.

Evaluate the answer and respond ONLY in this JSON format:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>"],
  "followUp": "<optional follow-up question>"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Question: ${params.question}\n\nAnswer: ${params.answer}` },
    ],
    temperature: 0.3,
    max_tokens: 800,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

/**
 * Generates a comprehensive feedback report for the entire interview.
 */
export async function generateFeedbackReport(params: {
  company: string;
  role: string;
  experience: string;
  questionsAndAnswers: { question: string; answer: string }[];
}) {
  const qaText = params.questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join("\n\n");

  const systemPrompt = `You are generating a comprehensive interview performance report for a ${params.experience} ${params.role} candidate at ${params.company}.

Analyze all questions and answers below, then respond ONLY in this JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "categories": [
    {"name": "Technical Accuracy", "score": <number>},
    {"name": "Communication", "score": <number>},
    {"name": "Problem Solving", "score": <number>},
    {"name": "System Design", "score": <number>},
    {"name": "Code Quality", "score": <number>}
  ],
  "questionFeedback": [
    {"questionIndex": 1, "score": <number>, "feedback": "<feedback>"}
  ],
  "recommendation": "<final recommendation paragraph>"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: qaText },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw);
}
