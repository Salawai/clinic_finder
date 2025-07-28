const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const clinics = [
  {
    name: "Community Health Clinic",
    address: "123 Main St, Austin, TX",
    city: "Austin",
    zip: "78701",
    phone: "512-555-1234",
    lat: 30.2672,
    lng: -97.7431,
    services: "Primary care, Mental health",
    cost: "Sliding scale"
  },
  // add more clinics here...
];

app.get("/api/clinics", (req, res) => {
  res.json(clinics);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
