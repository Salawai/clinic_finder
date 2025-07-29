let map;
let markers = [];

function initMap() {
  map = L.map("map").setView([30.2672, -97.7431], 6); // Default view: Texas

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function searchClinics() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  if (!query) return;

  fetch("https://clinic-finder-backend-s2pv.onrender.com/api/clinics")
    .then((res) => res.json())
    .then((data) => {
      const filtered = data.filter(c =>
        c.city.toLowerCase().includes(query) || c.zip.includes(query)
      );
      displayClinics(filtered);
    });
}

function displayClinics(clinics) {
  const list = document.getElementById("clinicList");
  list.innerHTML = "";

  // Remove previous markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (clinics.length === 0) {
    list.innerHTML = "<p>No clinics found for that location.</p>";
    return;
  }

  clinics.forEach(clinic => {
    const item = document.createElement("div");
    item.className = "card mb-2 p-3";
    item.innerHTML = `
      <strong>${clinic.name}</strong><br>
      ${clinic.address}<br>
      <strong>Phone:</strong> ${clinic.phone}<br>
      <strong>Services:</strong> ${clinic.services}<br>
      <strong>Cost:</strong> ${clinic.cost}
    `;
    list.appendChild(item);

    const marker = L.marker([clinic.lat, clinic.lng])
      .addTo(map)
      .bindPopup(`<b>${clinic.name}</b><br>${clinic.address}`);
    markers.push(marker);
  });

  if (clinics.length > 0) {
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

      const userMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("📍 You are here")
        .openPopup();

      markers.push(userMarker);
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Unable to retrieve your location.");
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initMap();

  // Trigger search on Enter
  const input = document.getElementById("searchInput");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      searchClinics();
    }
  });

  // Trigger search on button click
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", searchClinics);
  }

  // Trigger location detection
  const locateBtn = document.getElementById("locateBtn");
  if (locateBtn) {
    locateBtn.addEventListener("click", locateUser);
  }
});