let map;
let markers = [];

function showLoading(isLoading) {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = isLoading ? "block" : "none";
}

function initMap() {
  map = L.map("map").setView([30.2672, -97.7431], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function searchClinics() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const selectedService = document.getElementById("serviceFilter").value.toLowerCase();
  const selectedInsurance = document.getElementById("costFilter").value.toLowerCase();

  showLoading(true);

  fetch("https://clinic-finder-backend-s2pv.onrender.com/api/clinics")
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(c => {
        const zip = (c.zip || "").toString().toLowerCase();
        const city = (c.city || "").toLowerCase();
        const services = Array.isArray(c.services) ? c.services.join(", ").toLowerCase() : (c.services || "").toLowerCase();
        const insurance = Array.isArray(c.insurance_payment) ? c.insurance_payment.join(", ").toLowerCase() : (c.insurance_payment || "").toLowerCase();

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
    .finally(() => showLoading(false));
}

function displayClinics(clinics) {
  const list = document.getElementById("clinicList");
  list.innerHTML = "";

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (clinics.length === 0) {
    list.innerHTML = "<p>No clinics found for that location or filters.</p>";
    return;
  }

  clinics.forEach((clinic, index) => {
    const item = document.createElement("div");
    item.className = "card mb-2 p-3";
    item.id = `clinic-${index}`;

    const servicesText = Array.isArray(clinic.services) ? clinic.services.join(", ") : clinic.services || "N/A";
    const insuranceText = Array.isArray(clinic.insurance_payment) ? clinic.insurance_payment.join(", ") : clinic.insurance_payment || "N/A";
    const websiteLink = clinic.website
      ? `<strong>Website:</strong> <a href="https://${clinic.website}" target="_blank" rel="noopener noreferrer">${clinic.website}</a><br>`
      : "";

    item.innerHTML = `
      <strong>${index + 1}. ${clinic.name}</strong><br>
      ${clinic.address}<br>
      <strong>Phone:</strong> ${clinic.phone || "N/A"}<br>
      <strong>Services:</strong> ${servicesText}<br>
      <strong>Payment:</strong> ${insuranceText}<br>
      <strong>Hours:</strong> ${clinic.hours_label || "Unknown"}<br>
      ${websiteLink}
    `;

    list.appendChild(item);

    if (clinic.lat && clinic.lng) {
      const marker = L.marker([clinic.lat, clinic.lng])
        .addTo(map)
        .bindPopup(`<b>${clinic.name}</b><br>${clinic.address}`)
        .on('click', () => {
          document.getElementById(`clinic-${index}`).scrollIntoView({ behavior: "smooth", block: "start" });
          document.getElementById(`clinic-${index}`).classList.add("border", "border-primary");
          setTimeout(() => {
            document.getElementById(`clinic-${index}`).classList.remove("border", "border-primary");
          }, 2000);
        });

      markers.push(marker);
    }
  });

  if (clinics[0].lat && clinics[0].lng) {
    map.setView([clinics[0].lat, clinics[0].lng], 10);
  }
}

function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

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

// ✅ Safe AI assistant fetch (calls Replit backend proxy)
async function askAI(prompt) {
  const chatBox = document.getElementById("aiResponse");
  chatBox.innerText = "🤖 Thinking...";

  try {
    const response = await fetch("https://clinic-finder-ai-proxy.salawaiazhagan.repl.co/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const answer = data.answer || "Sorry, I couldn’t understand that.";
    chatBox.innerText = `🤖 ${answer}`;
  } catch (err) {
    console.error("AI error:", err);
    chatBox.innerText = "❌ AI assistant failed to respond.";
  }
}

// 🌐 Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  document.getElementById("searchBtn").addEventListener("click", searchClinics);
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchClinics();
  });
  document.getElementById("locateBtn").addEventListener("click", locateUser);
  document.getElementById("serviceFilter").addEventListener("change", searchClinics);
  document.getElementById("costFilter").addEventListener("change", searchClinics);

  const askBtn = document.getElementById("askBtn");
  if (askBtn) {
    askBtn.addEventListener("click", () => {
      const prompt = document.getElementById("askInput").value.trim();
      if (prompt) askAI(prompt);
    });
  }
});