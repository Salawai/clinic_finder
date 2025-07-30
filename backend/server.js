const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config(); // ✅ Optional: only needed if you use a .env file locally

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Needed to parse JSON bodies

// ✅ Load clinic data
const dataPath = path.join(__dirname, "data", "clinics.json");
let clinicsData = [];

try {
  const rawData = fs.readFileSync(dataPath);
  clinicsData = JSON.parse(rawData);
  console.log("✅ Clinic data loaded successfully");
} catch (err) {
  console.error("❌ Failed to load clinic data:", err);
}

// ✅ Root route for sanity check
app.get("/", (req, res) => {
  res.send("✅ Backend is running. Visit /api/clinics to get clinic data.");
});

// ✅ Serve clinics
app.get("/api/clinics", (req, res) => {
  res.json(clinicsData);
});

// ✅ AI assistant route
app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
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
          { role: "system", content: "You are a helpful assistant for finding free or low-cost clinics in the US. Be brief, local, and relevant to the user's query." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await openaiRes.json();

    if (!data.choices || !data.choices.length) {
      console.error("❌ No choices returned:", data);
      return res.status(500).json({ error: "No response from AI" });
    }

    const answer = data.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error("❌ Error in /ask route:", err);
    res.status(500).json({ error: "AI assistant failed" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});