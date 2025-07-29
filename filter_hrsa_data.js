const fs = require("fs");

// Load the raw HRSA data
const raw = fs.readFileSync("backend/data/hrsa_full.json");
const data = JSON.parse(raw);

// Set your state to filter (e.g., Texas)
const STATE = "TX";

// Filter and transform
const simplified = data
  .filter(entry => entry["Site State Abbreviation"] === STATE)
  .map(entry => ({
    name: entry["Site Name"],
    address: entry["Site Address"],
    city: entry["Site City"],
    state: entry["Site State Abbreviation"],
    zip: entry["Site Postal Code"],
    phone: entry["Site Telephone Number"],
    website: entry["Site Web Address"],
    lat: parseFloat(entry["Geocoding Artifact Address Primary Y Coordinate"]),
    lng: parseFloat(entry["Geocoding Artifact Address Primary X Coordinate"]),
    services: entry["Health Center Type"],
    organization: entry["Health Center Organization Name"]
  }));

// Save trimmed file
fs.writeFileSync("backend/data/clinics.json", JSON.stringify(simplified, null, 2));
console.log(`✅ Saved ${simplified.length} clinics to clinics.json`);