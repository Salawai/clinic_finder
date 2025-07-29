const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.get("/api/clinics", (req, res) => {
  const filePath = path.join(__dirname, "data", "clinics.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read clinic data" });
    }

    try {
      const clinics = JSON.parse(data);
      res.json(clinics);
    } catch (err) {
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
