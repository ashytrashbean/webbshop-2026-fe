import { getBaseUrl } from "./src/utils/api.js";

let emailInput = document.querySelector("#email");
let passwordInput = document.querySelector("#password");
let loginBtn = document.querySelector("#login");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Fyll i både e-post och lösenord.");
    return;
  }

  try {
    const url = `${getBaseUrl()}auth/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Inloggning lyckades!", data);
      localStorage.setItem("token", data.token);
    } else {
      console.error("Fel:", data.message);
      alert(data.message || "Något gick fel.");
    }

  } catch (error) {
    console.error("Nätverksfel:", error);
    alert("Kunde inte nå servern.");
  }
});


// ----------------- karta ----------------------------


let pinIcon = L.icon({
    iconUrl: './images/pin-logo.png',

    iconSize:     [38, 50], // size of the icon
    iconAnchor:   [19, 50], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

// inside the setView([latitude, longitude], map view distance)
const map =L.map('map').setView([61.52, 12.74], 4);

// This is purely the map object itself
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Creates the search function
L.Control.geocoder().addTo(map);

let selectCoordinates = [61.52, 12.74];
let currentManualMarker = null;

function manualLocation(latlng){
    const coords = [latlng.lat, latlng.lng];
    selectCoordinates = coords;
    
    if(currentManualMarker){
        currentManualMarker.setLatLng(latlng);
    } else {
        currentManualMarker = L.marker(latlng, {icon: pinIcon, draggable: true}).addTo(map);
    }
    map.flyTo(coords,15);
}

map.on('click', (e)=> manualLocation(e.latlng));

const geocoder = L.Control.geocoder({ defaultMarkGeocode: false}).addTo(map);
geocoder.on('markgeocode', (e)=> manualLocation(e.geocode.center));


// ----------------- karta ----------------------------



let registerName = document.querySelector("#registerUsername");
let registerEmail = document.querySelector("#registerUserEmail");
let registerPassword = document.querySelector("#registerUserPassword");
let signupBtn = document.querySelector("#signupBtn");

signupBtn.addEventListener("click", async () => {
  const name = registerName.value;
  const email = registerEmail.value;
  const password = registerPassword.value;

  // Enkel validering
  if (!email || !password) {
    alert("Fyll i både e-post och lösenord.");
    return;
  }

    try {
    const url = `${getBaseUrl()}auth/register`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password , selectCoordinates})
    });

    const data = await response.json();

    if (response.ok) {
        console.log("Registrering lyckades!", data);
        localStorage.setItem("token", data.token);
    } else {
        console.error("Fel:", data.message);
        alert(data.message || "Något gick fel.");
    }

    } catch (error) {
    console.error("Nätverksfel:", error);
    alert("Kunde inte nå servern.");
    }
})