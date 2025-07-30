// === Core Dependencies ===
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// node-fetch is imported dynamically to stay compatible across Node versions
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Optional: load environment variables (e.g., OpenAI API key)
require("dotenv").config();

// === App Setup ===
const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
// Enable CORS for frontend to talk to this backend
app.use(cors());
// Parse incoming JSON bodies
app.use(express.json());

// === Load clinic data from file ===
const dataPath = path.join(__dirname, "data", "clinics.json");
let clinicsData = [];

try {
  const rawData = fs.readFileSync(dataPath);
  clinicsData = JSON.parse(rawData);
  console.log("✅ Clinic data loaded successfully");
} catch (err) {
  console.error("❌ Failed to load clinic data:", err);
}

// === Basic sanity check route ===
// Just to make sure the backend is alive
app.get("/", (req, res) => {
  res.send("✅ Backend is running. Visit /api/clinics to get clinic data.");
});

// === Serve static clinic list ===
// This is used by the frontend map/search
app.get("/api/clinics", (req, res) => {
  res.json(clinicsData);
});

// === AI Assistant Endpoint ===
// This route connects to OpenAI's Chat API
app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // If no key, return placeholder response
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ No OpenAI API key configured");
    return res.json({
      answer: "🛠️ Work in progress. AI support not yet configured."
    });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for finding free or low-cost clinics in the US. Be brief, local, and relevant to the user's query."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await openaiRes.json();

    // Handle OpenAI API errors
    if (data.error) {
      console.error("❌ OpenAI error:", data.error.message || data.error);
      return res.json({
        answer: `⚠️ AI error: ${data.error.message || "Something went wrong"}`
      });
    }

    if (!data.choices || !data.choices.length) {
      console.error("❌ No choices returned:", data);
      return res.json({ answer: "⚠️ No AI response available." });
    }

    // Return the assistant's reply
    const answer = data.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error("❌ Error in /ask route:", err);
    res.json({
      answer: "🛠️ Work in progress. The assistant is currently unavailable."
    });
  }
});

// === Start the server ===
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});