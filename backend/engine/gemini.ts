import fs from 'fs/promises';
import path from 'path';

// using native fetch available in Node >= 18

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const CACHE_FILE = path.join(process.cwd(), 'data', 'cache.json');

async function readCache(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function writeCache(cache: Record<string, any>) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

async function getPlayers(): Promise<any[]> {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'players.json'), 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

interface HistoryItem {
  question: string;
  answer: string;
}

async function callGemini(prompt: string) {
  const cache = await readCache();
  if (cache[prompt]) {
    console.log("Using cached response for prompt");
    return cache[prompt];
  }

  // Add a 1-second pause to stay under the RPM limit
  await delay(1000); 

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
    const error: any = new Error(response.status === 429 ? "API Rate Limit Exceeded: Please wait a few seconds and try again." : "Failed to call Gemini API");
    error.status = response.status;
    throw error;
  }

  const data = await response.json() as any;
  let text = data.candidates[0].content.parts[0].text;

  // Remove markdown code blocks if present
  text = text.replace(/^```json\n?/, "").replace(/```\n?$/, "").trim();

  try {
    const result = JSON.parse(text);
    const cache = await readCache();
    cache[prompt] = result;
    await writeCache(cache);
    return result;
  } catch (error) {
    console.error("Failed to parse JSON:", text);
    throw error;
  }
}

async function callGeminiWithRetry(prompt: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await callGemini(prompt);
    } catch (error: any) {
      if (error.status === 429 && i < retries - 1) {
        console.log(`Rate limit hit, retrying in ${i + 1}s...`);
        await delay(2000 * (i + 1)); // Wait longer each time
        continue;
      }
      throw error;
    }
  }
}

export const engine = {
  async generateQuestion(history: HistoryItem[]): Promise<string> {
    const players = await getPlayers();
    const playerNames = players.map(p => p.name).join(", ");
    
    const prompt = `You are the IPL Akinator. You must guess which IPL cricket player the user is thinking of from this specific list: [${playerNames}].
This is the very first question of the game. Ask a strategic Yes/No question to narrow down this specific pool of players efficiently.
You only have 8 questions total for the whole game.
Output JSON only: { "type": "question", "question": "Your question here?" }`;

    const result = await callGeminiWithRetry(prompt);
    return result.question || "Does your player play for India?";
  },

  async makeGuess(history: HistoryItem[]): Promise<{ guess: string; confidence: number }> {
    const players = await getPlayers();
    const historyText = history.map((h, i) => `Q${i + 1}: ${h.question} | A${i + 1}: ${h.answer}`).join("\n");
    
    const prompt = `You are the IPL Akinator. You must guess the player from this list: [${players.map(p => p.name).join(", ")}].
History:
${historyText}

Based on this, make your absolute best guess from the provided list.
Output JSON only: { "type": "guess", "guess": "Player Name", "confidence": 99 }`;

    const result = await callGeminiWithRetry(prompt);
    return {
      guess: result.guess || "MS Dhoni",
      confidence: result.confidence || 90
    };
  },

  async processNextAction(history: HistoryItem[], questionCount: number): Promise<{ type: "question" | "guess", question?: string, guess?: string, confidence?: number }> {
    const players = await getPlayers();
    const playerNames = players.map(p => p.name).join(", ");
    const historyText = history.map((h, i) => `Q${i + 1}: ${h.question} | A${i + 1}: ${h.answer}`).join("\n");
    
    const prompt = `You are the IPL Akinator. You are narrowing down a player from this list: [${playerNames}].
Current History:
${historyText}

Question Count: ${questionCount} / 8.
Rules:
1. If you are highly confident (>90%) OR if this is your 8th turn (questionCount is 7, meaning the next action MUST be a guess), you MUST output a guess.
2. Otherwise, ask a strategic YES/NO question to further narrow down the provided list. Do not repeat questions.
3. You MUST eventually guess a player that is in the provided list.

Output JSON only:
If asking: { "type": "question", "question": "..." }
If guessing: { "type": "guess", "guess": "...", "confidence": ... }`;

    const result = await callGeminiWithRetry(prompt);
    return result;
  }
};
