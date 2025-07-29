const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend-backend communication
app.use(cors());

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

// Root route for sanity check
app.get("/", (req, res) => {
  res.send("✅ Backend is running. Visit /api/clinics to get clinic data.");
});

// API endpoint to serve clinics
app.get("/api/clinics", (req, res) => {
  res.json(clinicsData);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});