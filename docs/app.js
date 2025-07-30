// app.js

let map;
let markers = []; // Store all map markers here so we can remove them later

// Show or hide the loading spinner
function showLoading(isLoading) {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) {
    spinner.style.display = isLoading ? "block" : "none";
  }
}

// Initialize the Leaflet map
function initMap() {
  map = L.map("map").setView([30.2672, -97.7431], 6); // Default center: Austin, TX

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

// Fetch clinic data and apply filters
function searchClinics() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const selectedService = document.getElementById("serviceFilter").value.toLowerCase();
  const selectedInsurance = document.getElementById("costFilter").value.toLowerCase();

  showLoading(true); // Spinner ON

  fetch("https://clinic-finder-backend-s2pv.onrender.com/api/clinics")
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(clinic => {
        const zip = (clinic.zip || "").toString().toLowerCase();
        const city = (clinic.city || "").toLowerCase();
        const services = Array.isArray(clinic.services)
          ? clinic.services.join(", ").toLowerCase()
          : (clinic.services || "").toLowerCase();
        const insurance = Array.isArray(clinic.insurance_payment)
          ? clinic.insurance_payment.join(", ").toLowerCase()
          : (clinic.insurance_payment || "").toLowerCase();

        const matchesQuery = !query || city.includes(query) || zip.includes(query);
        const matchesService = !selectedService || services.includes(selectedService);
        const matchesInsurance = !selectedInsurance || insurance.includes(selectedInsurance);

        return matchesQuery && matchesService && matchesInsurance;
      });

      displayClinics(filtered);
    })
    .catch(err => {
      console.error("❌ Failed to fetch clinics:", err);
      document.getElementById("clinicList").innerHTML = "<p>Error loading clinic data.</p>";
    })
    .finally(() => showLoading(false)); // Spinner OFF
}

// Render the list of filtered clinics + markers on the map
function displayClinics(clinics) {
  const list = document.getElementById("clinicList");
  list.innerHTML = ""; // Clear previous results

  // Remove old markers from the map
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  if (clinics.length === 0) {
    list.innerHTML = "<p>No clinics found for that location or filters.</p>";
    return;
  }

  clinics.forEach((clinic, index) => {
    const card = document.createElement("div");
    card.className = "card mb-2 p-3 clinic-card";
    card.id = `clinic-${index}`;

    // Not the cleanest string handling, but it works for now
    const servicesText = Array.isArray(clinic.services)
      ? clinic.services.join(", ")
      : clinic.services || "N/A";

    const insuranceText = Array.isArray(clinic.insurance_payment)
      ? clinic.insurance_payment.join(", ")
      : clinic.insurance_payment || "N/A";

    const websiteLink = clinic.website
      ? `<strong>Website:</strong> <a href="https://${clinic.website}" target="_blank" rel="noopener noreferrer">${clinic.website}</a><br>`
      : "";

    card.innerHTML = `
      <strong>${index + 1}. ${clinic.name}</strong><br>
      ${clinic.address}<br>
      <strong>Phone:</strong> ${clinic.phone || "N/A"}<br>
      <strong>Services:</strong> ${servicesText}<br>
      <strong>Payment:</strong> ${insuranceText}<br>
      <strong>Hours:</strong> ${clinic.hours_label || "Unknown"}<br>
      ${websiteLink}
    `;

    list.appendChild(card);

    // Only drop a pin if lat/lng are available
    if (clinic.lat && clinic.lng) {
      const marker = L.marker([clinic.lat, clinic.lng])
        .addTo(map)
        .bindPopup(`<b>${clinic.name}</b><br>${clinic.address}`)
        .on("click", () => {
          // Quick hacky scroll into view — works fine on most devices
          card.scrollIntoView({ behavior: "smooth", block: "start" });
          card.classList.add("highlight-card");
          setTimeout(() => card.classList.remove("highlight-card"), 2000);
          map.setView([clinic.lat, clinic.lng], 12);
        });

      markers.push(marker);
    }
  });

  // Zoom in on first result — could improve later by bounding all markers
  if (clinics[0].lat && clinics[0].lng) {
    map.setView([clinics[0].lat, clinics[0].lng], 10);
  }
}

// Find and mark the user's current location
function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Drop a pin at user's location — simple but effective
      map.setView([lat, lng], 12);

      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("📍 You are here")
        .openPopup();

      markers.push(marker);
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Unable to retrieve your location.");
    }
  );
}

// Handle question submission to the AI assistant
async function askAI(prompt) {
  const chatBox = document.getElementById("aiResponse");
  chatBox.innerText = "🧠 Thinking...";

  try {
    const response = await fetch("https://clinic-finder-backend-s2pv.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const answer = data.answer || "Sorry, I couldn’t understand that.";
    chatBox.innerText = `🧠 ${answer}`;
  } catch (err) {
    console.error("AI error:", err);
    chatBox.innerText = "❌ AI assistant failed to respond.";
  }
}

// Wire up event listeners when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  initMap();

  // Search button
  document.getElementById("searchBtn").addEventListener("click", searchClinics);

  // Search on pressing Enter
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchClinics();
  });

  // Filter dropdowns
  document.getElementById("serviceFilter").addEventListener("change", searchClinics);
  document.getElementById("costFilter").addEventListener("change", searchClinics);

  // Locate me button
  document.getElementById("locateBtn").addEventListener("click", locateUser);

  // Ask AI button
  const askBtn = document.getElementById("askBtn");
  if (askBtn) {
    askBtn.addEventListener("click", () => {
      const prompt = document.getElementById("askInput").value.trim();
      if (prompt) askAI(prompt);
    });
  }
});