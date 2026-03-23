// my-backend-server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

function loadServiceAccount() {
  const firebasePath = path.join(__dirname, "firebase.json");

  if (!fs.existsSync(firebasePath)) {
    throw new Error(`firebase.json not found at ${firebasePath}`);
  }

  return require("./firebase.json");
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const OpenAIClient = OpenAI.default ?? OpenAI;
const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
});

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    console.log("verifyFirebaseToken -> token length:", token.length);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("verifyFirebaseToken -> uid:", decodedToken.uid);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("verifyFirebaseToken error:", error);
    return res.status(401).json({
      error: "Invalid Firebase ID token",
      details: error.message,
    });
  }
}

app.get("/", (_req, res) => {
  res.send("🚀 PromptVault API is running!");
});

app.get("/health", async (_req, res) => {
  try {
    await db.collection("_health").limit(1).get();
    return res.json({ ok: true, firestore: true });
  } catch (error) {
    console.error("/health firestore error:", error);
    return res.status(500).json({
      ok: false,
      firestore: false,
      error: error.message,
    });
  }
});

app.get("/api/debug-auth", verifyFirebaseToken, async (req, res) => {
  return res.json({
    ok: true,
    uid: req.user.uid,
    email: req.user.email || null,
  });
});

app.get("/api/debug-firestore", verifyFirebaseToken, async (req, res) => {
  try {
    const ref = db.collection("users").doc(req.user.uid);
    const snap = await ref.get();

    return res.json({
      ok: true,
      exists: snap.exists,
      data: snap.exists ? snap.data() : null,
    });
  } catch (error) {
    console.error("/api/debug-firestore error:", error);
    return res.status(500).json({
      ok: false,
      where: "debug-firestore",
      error: error.message,
      code: error.code || null,
    });
  }
});

app.get("/api/credits", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let credits = 3;

    if (!userDoc.exists) {
      await userRef.set({ credits: 3 }, { merge: true });
      credits = 3;
    } else {
      credits = Number(userDoc.data()?.credits ?? 3);
      if (Number.isNaN(credits)) credits = 3;
    }

    console.log("/api/credits ->", uid, credits);
    return res.json({ credits });
  } catch (error) {
    console.error("/api/credits error:", error);
    return res.status(500).json({
      error: error.message,
      code: error.code || null,
      where: "/api/credits",
    });
  }
});

app.post("/api/generate", verifyFirebaseToken, async (req, res) => {
  try {
    const prompt = (req.body?.prompt || "").toString().trim();

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const uid = req.user.uid;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let currentCredits = 3;

    if (!userDoc.exists) {
      await userRef.set({ credits: 3 }, { merge: true });
      currentCredits = 3;
    } else {
      currentCredits = Number(userDoc.data()?.credits ?? 0);
      if (currentCredits <= 0) {
        return res.status(403).json({
          error: "Out of credits",
          triggerPaywall: true,
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an elite Prompt Engineer. Only output the final engineered prompt. No explanations.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 900,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";

    if (!text) {
      return res.status(500).json({ error: "Empty response from model" });
    }

    await userRef.set(
      { credits: admin.firestore.FieldValue.increment(-1) },
      { merge: true }
    );

    return res.json({
      data: text,
      creditsRemaining: currentCredits - 1,
    });
  } catch (error) {
    console.error("/api/generate error:", error);
    return res.status(500).json({
      error: error.message,
      code: error.code || null,
      where: "/api/generate",
    });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});