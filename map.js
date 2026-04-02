import { getBaseUrl } from "./src/utils/api.js";
import { openPlantModal } from "./../src/scripts/index.js";
// import { icon } from "leaflet";

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

// -------------------------------------------

async function Getplants(map) {
    const url = `${getBaseUrl()}plants`;
    const response = await fetch(url);

    // getting the plant data here
    const plants = await response.json();

    // Create the Plant Card (HTML)
    // We use "Template Literals" (the backticks ``) to inject the data
    const cardContainer = document.getElementById('plant-grid');

    let allCardsHtml ="";

    // This is your "Engine"
    plants.forEach(plant => {

        // A. Create the Map Pin
        // We use the lat/lng from the specific plant object
        const marker = L.marker(plant.coordinates, {icon: pinIcon}).addTo(map);
        marker.bindPopup(`<b>${plant.name}</b><br>
        <img src="${plant.image}" alt="${plant.name}" height="100"><br>
        <button id="more-info-${plant._id}">More info</button>`);

        marker.on("popupopen", () => {
        const button = document.getElementById(`more-info-${plant._id}`);
        if (button) {
            button.onclick = () => openPlantModal(plant);
        }});

        

        allCardsHtml = `
        <div class="plant-card" data-id="${plant._id}">
            <img src="${plant.image}" alt="${plant.name}" height="100">
            <h3>${plant.name}</h3>
            <p>Light level: ${plant.lightLevels}</p>
        </div>
        `;

        // This adds the card to your grid on the screen
        cardContainer.innerHTML += allCardsHtml;
    });

        return plants;
}

Getplants(map);