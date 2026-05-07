import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { engine } from "./backend/engine/gemini.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Session {
  id: string;
  history: { question: string; answer: string }[];
  questionCount: number;
}

const sessions = new Map<string, Session>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/start", async (req, res) => {
    try {
      const sessionId = uuidv4();
      sessions.set(sessionId, {
        id: sessionId,
        history: [],
        questionCount: 0,
      });

      const firstQuestion = await engine.generateQuestion([]);
      sessions.get(sessionId)!.questionCount++;
      sessions.get(sessionId)!.history.push({ question: firstQuestion, answer: "" });

      res.json({ sessionId, question: firstQuestion });
    } catch (error) {
      console.error("Start error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to start game" });
    }
  });

  app.post("/api/answer", async (req, res) => {
    const { sessionId, answer } = req.body;
    
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(400).json({ error: "Invalid or missing session ID" });
    }

    if (!["yes", "no", "unknown"].includes(answer?.toLowerCase())) {
      return res.status(400).json({ error: "Answer must be 'yes', 'no', or 'unknown'" });
    }

    const session = sessions.get(sessionId)!;
    
    // Update the last question's answer in history
    if (session.history.length > 0) {
      session.history[session.history.length - 1].answer = answer;
    }

    try {
      // If we reached 8 questions, force a guess
      if (session.questionCount >= 8) {
        const guessResult = await engine.makeGuess(session.history);
        return res.json({ guess: guessResult.guess, confidence: guessResult.confidence });
      }

      // Ask Gemini for next action (either next question or final guess if confident)
      const action = await engine.processNextAction(session.history, session.questionCount);

      if (action.type === "guess") {
        res.json({ guess: action.guess, confidence: action.confidence });
      } else {
        session.questionCount++;
        session.history.push({ question: action.question, answer: "" });
        res.json({ question: action.question });
      }
    } catch (error) {
      console.error("Answer error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process answer" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
