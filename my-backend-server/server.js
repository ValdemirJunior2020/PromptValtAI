// my-backend-server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const OpenAIClient = OpenAI.default ?? OpenAI;
const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_CREDITS = 3;
const creditsStore = new Map();

function getUserKey(req) {
  const raw =
    req.headers["x-user-id"] ||
    req.body?.userId ||
    req.query?.userId ||
    "guest";
  return String(raw).trim() || "guest";
}

function getCredits(userId) {
  if (!creditsStore.has(userId)) {
    creditsStore.set(userId, DEFAULT_CREDITS);
  }
  return creditsStore.get(userId);
}

function setCredits(userId, value) {
  creditsStore.set(userId, value);
  return value;
}

app.get("/", (_req, res) => {
  res.send("🚀 PromptVault API is running!");
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    model: OPENAI_MODEL,
    authMode: "temporary-no-firebase-admin",
  });
});

app.get("/api/credits", (req, res) => {
  try {
    const userId = getUserKey(req);
    const credits = getCredits(userId);

    console.log("GET /api/credits ->", { userId, credits });

    return res.json({ credits });
  } catch (error) {
    console.error("❌ /api/credits error:", error);
    return res.status(500).json({
      error: error.message || "Failed to load credits",
    });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const userId = getUserKey(req);
    const prompt = (req.body?.prompt || "").toString().trim();

    console.log("POST /api/generate ->", {
      userId,
      promptLength: prompt.length,
    });

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const currentCredits = getCredits(userId);

    if (currentCredits <= 0) {
      return res.status(403).json({
        error: "Out of credits",
        triggerPaywall: true,
      });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an elite Prompt Engineer. Only output the final engineered prompt. No explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 900,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";

    if (!text) {
      return res.status(500).json({ error: "Empty response from model" });
    }

    const creditsRemaining = setCredits(userId, currentCredits - 1);

    console.log("✅ /api/generate success ->", {
      userId,
      creditsRemaining,
    });

    return res.json({
      data: text,
      creditsRemaining,
    });
  } catch (error) {
    console.error("❌ /api/generate error:", error);
    return res.status(500).json({
      error: error.message || "Generation failed",
    });
  }
});

app.post("/api/purchase", (req, res) => {
  try {
    const userId = getUserKey(req);
    const amount = Number(req.body?.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const currentCredits = getCredits(userId);
    const credits = setCredits(userId, currentCredits + amount);

    console.log("POST /api/purchase ->", { userId, amount, credits });

    return res.json({
      success: true,
      credits,
    });
  } catch (error) {
    console.error("❌ /api/purchase error:", error);
    return res.status(500).json({
      error: error.message || "Purchase failed",
    });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});