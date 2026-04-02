import { openPlantModal } from "./../src/scripts/index.js";

// inside the setView([latitude, longitude], map view distance)
const map =L.map('map').setView([61.52, 12.74], 4);

// This is purely the map object itself
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// This function runs every single time the map stops moving to see latitude and longitude
map.on('moveend', function() {
    var center = map.getCenter();
    console.log(`Map stopped at: lat: ${center.lat.toFixed(2)}, long: ${center.lng.toFixed(2)}`);
});

// Creates the search function
L.Control.geocoder().addTo(map);

// -------------------------------------------
const mockPlantData = [
{
    id: "p1",
    name: "Monstera",
    image: "monstera.jpg",
    lat: 59.3293,
    lng: 18.0686,
    owner: "Alice",
    water: "Standard"
},
{
    id: "p2",
    name: "Spider Plant",
    image: "spider.jpg",
    lat: 59.3320,
    lng: 18.0650,
    owner: "Bob",
    water: "Thirsty"
}
];

// This is your "Engine"
mockPlantData.forEach(plant => {

// A. Create the Map Pin
// We use the lat/lng from the specific plant object
const marker = L.marker([plant.lat, plant.lng]).addTo(map);
marker.bindPopup(`<b>${plant.name}</b><br>
    <img src="${plant.image}" alt="${plant.name}"><br>
    Owned by ${plant.owner}<br>
    <button id="more-info-${plant.id}">More info</button>`);

marker.on("popupopen", () => {
    const button = document.getElementById(`more-info-${plant.id}`);
    if (button) {
        button.onclick = () => openPlantModal(plant);
    }
});

// B. Create the Plant Card (HTML)
// We use "Template Literals" (the backticks ``) to inject the data
const cardContainer = document.getElementById('plant-grid');

const cardHTML = `
<div class="plant-card" data-id="${plant.id}">
    <img src="${plant.image}" alt="${plant.name}">
    <h3>${plant.name}</h3>
    <p>Water Need: ${plant.water}</p>
    <button>Contact ${plant.owner}</button>
</div>
`;

// This adds the card to your grid on the screen
cardContainer.innerHTML += cardHTML;
});