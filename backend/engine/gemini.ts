// using native fetch available in Node >= 18

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface HistoryItem {
  question: string;
  answer: string;
}

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    if (response.status === 429) {
      throw new Error("API Rate Limit Exceeded: Please wait a few seconds and try again.");
    }
    throw new Error("Failed to call Gemini API");
  }

  const data = await response.json() as any;
  let text = data.candidates[0].content.parts[0].text;
  
  // Remove markdown code blocks if present
  text = text.replace(/^```json\n?/, "").replace(/```\n?$/, "").trim();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON:", text);
    throw error;
  }
}

export const engine = {
  async generateQuestion(history: HistoryItem[]): Promise<string> {
    const prompt = `You are the IPL Akinator. You must guess the IPL cricket player (from 2008 to 2026) the user is thinking of.
This is the very first question of the game. Ask a strategic Yes/No question to narrow down the pool of IPL players (e.g. asking about nationality, role, or a major team).
Output JSON only with this schema: { "type": "question", "question": "Your question here?" }`;

    const result = await callGemini(prompt);
    return result.question || "Does your player play for India?";
  },

  async makeGuess(history: HistoryItem[]): Promise<{ guess: string; confidence: number }> {
    const historyText = history.map((h, i) => `Q${i + 1}: ${h.question} | A${i + 1}: ${h.answer}`).join("\n");
    const prompt = `You are the IPL Akinator. You must guess the IPL cricket player (from 2008 to 2026) the user is thinking of.
Here is the history of questions and the user's answers:
${historyText}

Based on this history, make your absolute best guess for who the player is.
Output JSON only with this schema: { "type": "guess", "guess": "Player Name", "confidence": 99 }`;

    const result = await callGemini(prompt);
    return {
      guess: result.guess || "MS Dhoni",
      confidence: result.confidence || 90
    };
  },

  async processNextAction(history: HistoryItem[], questionCount: number): Promise<{ type: "question" | "guess", question?: string, guess?: string, confidence?: number }> {
    const historyText = history.map((h, i) => `Q${i + 1}: ${h.question} | A${i + 1}: ${h.answer}`).join("\n");
    const prompt = `You are the IPL Akinator. You must guess the IPL cricket player (from 2008 to 2026) the user is thinking of.
The user has been answering your questions with "yes", "no", or "unknown".
Here is the history of questions and answers:
${historyText}

You have asked ${questionCount} questions so far. You are allowed a maximum of 8 questions.
Based on this history:
1. If you are highly confident (>95%) about the player, OR if you have already asked 7 questions (meaning this would be the 8th and final question), you MUST output a final guess instead of asking another question.
2. Otherwise, output the next best YES/NO question to narrow down the possibilities. Do not repeat previous questions. Make it strategic (e.g., about specific franchises, captaincy, left/right handed, bowler/batter).

Output JSON only with this schema:
If asking a question: { "type": "question", "question": "Your question here?" }
If guessing: { "type": "guess", "guess": "Player Name", "confidence": 98 }`;

    const result = await callGemini(prompt);
    return result;
  }
};
