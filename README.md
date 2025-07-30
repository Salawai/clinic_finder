# CareMap

**Find Free & Low-Cost Clinics Near You**

CareMap is a web app that helps users quickly locate free or low-cost health clinics in the United States. Whether you’re uninsured or just looking for accessible care, CareMap connects you to nearby clinics using public data and a clean, mobile-friendly interface.

---

## 🌍 Live Demo

- Web app: [https://salawai.github.io/clinic\_finder/](https://salawai.github.io/clinic_finder/)
- Backend API: [https://clinic-finder-backend-s2pv.onrender.com/api/clinics](https://clinic-finder-backend-s2pv.onrender.com/api/clinics)

---

## Features

- Location-based clinic search by ZIP or city
- Map view with Leaflet.js
- Filter by service (e.g. dental, behavioral health)
- Filter by payment type (e.g. sliding scale, Medicaid)
- Ask AI a clinic-related question (when quota is available)
- PWA support (installable on mobile)
- Responsive UI designed for mobile & desktop

---

## Folder Structure

```
CLINIC_FINDER_CLEAN
├── backend
│   ├── data
│   │   ├── Health_Center_Service_Delivery_and_LookAlike_Sites.csv
│   │   ├── clinics.json  ← cleaned output used by API
│   │   └── convert_hrsa_to_clinics.py
│   ├── server.js
│   ├── package.json
│   └── .env (optional)
│
├── docs
│   ├── index.html
│   ├── app.js
│   ├── manifest.json
│   └── service-worker.js
│
├── filter_hrsa_data.js
├── .gitignore
└── README.md
```

---

## Getting Started

### 🔧 Local Dev

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Run backend locally**

   ```bash
   node server.js
   ```

   Open: `http://localhost:3000/api/clinics`

3. **Open frontend** Open `docs/index.html` in your browser

### 🛰 Deploy Backend (Render)

- Deployed using [Render.com](https://render.com)
- Just push your backend folder to GitHub and use a Node service
- Make sure to expose `PORT` in Render and optionally add an `.env` with your OpenAI key

---

## Troubleshooting

### API Quota Error (AI Feature)

If you see this error:

```
❌ OpenAI error: You exceeded your current quota...
```

It means your OpenAI API key has run out of free usage or credit.

**Steps to fix:**

- Check usage: [https://platform.openai.com/account/usage](https://platform.openai.com/account/usage)
- Add billing (if needed): [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
- Or temporarily comment out `/ask` route in `server.js`

### Map Not Loading?

- Make sure you’re connected to the internet
- Leaflet or CDN might be blocked by extensions/firewall

---

## Data Source

- [HRSA Health Center Look-Alike Sites](https://data.hrsa.gov)
- We parse, filter, and infer fields from the full CSV using Python (see `convert_hrsa_to_clinics.py`)

---

## Tech Stack

- **Frontend:** HTML, Bootstrap, Leaflet.js, Vanilla JS
- **Backend:** Node.js + Express
- **Data Cleaning:** Python
- **Hosting:** GitHub Pages (frontend), Render (backend API)
- **Extras:** Service Workers (PWA), Geolocation, OpenAI API

---

## Future Plans

- Add directions via Google Maps or OpenStreetMap
- Add multi-language support (i18n)
- User reviews/ratings for clinics
- Admin interface to flag/remove closed clinics
- More AI questions (e.g. "where to get free birth control")

---

## Acknowledgments

- Clinic data: [HRSA](https://data.hrsa.gov)
- Icons: [Flaticon](https://www.flaticon.com/)
- Map: [Leaflet.js](https://leafletjs.com/)
- AI: [OpenAI GPT API](https://platform.openai.com/)
- Hosting: [Render](https://render.com), [GitHub Pages](https://pages.github.com/)

---

## License

MIT — free to reuse, fork, and build upon.

