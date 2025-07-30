const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // <-- Added for OpenAI requests
require("dotenv").config(); // <-- Optional: for loading .env locally

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json()); // <-- Needed to parse JSON POST bodies

// Load clinic data
const dataPath = path.join(__dirname, "data", "clinics.json");
let clinicsData = [];

try {
  const rawData = fs.readFileSync(dataPath);
  clinicsData = JSON.parse(rawData);
  console.log("✅ Clinic data loaded successfully");
} catch (err) {
  console.error("❌ Failed to load clinic data:", err);
}

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is running. Visit /api/clinics to get clinic data.");
});

// Clinics API endpoint
app.get("/api/clinics", (req, res) => {
  res.json(clinicsData);
});

// AI assistant proxy endpoint
app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key is not configured." });
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
          { role: "system", content: "You are a helpful assistant for finding clinics based on services, cost, and location." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await openaiRes.json();
    const message = data.choices?.[0]?.message?.content || "No response from AI";
    res.json({ answer: message });

  } catch (err) {
    console.error("❌ AI fetch error:", err);
    res.status(500).json({ error: "Failed to contact AI service." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});