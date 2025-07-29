# 🏥 Clinic Finder

A simple web app that helps users find free or low-cost clinics based on ZIP code or city — built for a hackathon!

---

## 🔧 Features

- Search by ZIP or city
- Filter by services and cost
- Map view with clinic pins (Leaflet.js + OpenStreetMap)
- Backend API powered by Express.js
- Hosted frontend on GitHub Pages
- Clinic data sourced from HRSA and filtered for relevance

---

## 🔗 Live Links

- **Frontend (GitHub Pages)**: [https://your-username.github.io/clinic_finder/frontend](#)
- **Backend (Render or Localhost)**: `https://your-api.onrender.com/api/clinics`

---

## 🗂 Project Structure

clinic_finder/
├── backend/ # Express server + clinic data API
│ ├── data/
│ │ ├── clinics.json # Cleaned/filtered dataset
│ │ └── hrsa_full.json # Raw HRSA data (large, gitignored)
│ └── server.js
│
├── frontend/ # Frontend static files
│ ├── index.html
│ └── app.js
│
├── filter_hrsa_data.js # Script to clean/transform HRSA data
├── .gitignore
└── README.md