import { getBaseUrl } from "./src/utils/api.js";
// import { smartFetch } from "./src/utils/api.js";
import { openPlantModal } from "./src/scripts/plantModal.js";

// const currentUser = {
//     _id: "demo-user-123",
//     name: "Demo User"
// };


const isLoggedIn = !!sessionStorage.getItem("accessToken");
const savedUserInfo = JSON.parse(localStorage.getItem("userInfo"));


let pinIcon = L.icon({
    iconUrl: './images/pin-logo.png',

    iconSize:     [38, 50], // size of the icon
    iconAnchor:   [19, 50], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

// Find starting coordinates: Use user's home OR default to Sweden
const startCoords = (isLoggedIn && savedUserInfo?.location)
    ? savedUserInfo.location
    : [61.52, 12.74];

// inside the setView([latitude, longitude], map view distance)
const map =L.map('map').setView(startCoords, isLoggedIn ? 12 : 4);
// 12 is zoomed in close to home, 4 is zoomed out to the whole country

// This is purely the map object itself
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Creates the search function
L.Control.geocoder().addTo(map);

// -------------------------------------------
function filterCardsByMap(map, markerMap){
    const bounds = map.getBounds();

    for(const plantId in markerMap){
        const marker = markerMap[plantId];
        const card = document.querySelector(`.plant-card[data-id="${plantId}]"`);

        if(card){
            if(bounds.contains(marker.getLatLng())){
                card.style.display = "block";
            }else{
                card.style.display = "none";
            }
        }
    }
}

// -------------------------------------------

async function Getplants(map) {
    const url = `${getBaseUrl()}plants`;
    
    const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }); 

    // getting the plant data here
    const plants = await response.json();

    // Create the Plant Card (HTML)
    // We use "Template Literals" (the backticks ``) to inject the data
    const cardContainer = document.getElementById('plant-grid');

    let allCardsHtml ="";

    const markers = new L.MarkerClusterGroup();

    const markerMap= {};

    // This is your "Engine"
    plants.forEach(plant => {

        // A. Create the Map Pin
        // We use the lat/lng from the specific plant object

        const marker = L.marker(plant.coordinates, {icon: pinIcon});

        
        marker.bindPopup(`<b>${plant.name}</b><br>
            <img src="${plant.image}" alt="${plant.name}" width="100%"><br>
            <button id="more-info-${plant._id}" class="more-info-btn">More info</button>`);
            
        marker.on("popupopen", () => {
            const button = document.getElementById(`more-info-${plant._id}`);
            if (button) {
                button.onclick = () => {
                    if(isLoggedIn){
                        openPlantModal(plant);
                    } else{
                        Toastify({
                            text: "Join the community to see details and trade plants",
                            duration: 2000,
                            gravity: "top",
                            position: "center",
                            style : {
                                background: "linear-gradient(to right, #4CAF50, #81C784)",
                                color: "#fff",
                            }
                        }).showToast();
                    }
                };
            }
        });
        markers.addLayer(marker);
        markerMap[plant._id] = marker;

        

        allCardsHtml = `
        <div class="plant-card" data-id="${plant._id}">
            <img src="${plant.image}" alt="${plant.name}" height="91px">
            <h4>${plant.name}</h4>
            <p><i>${plant.species}</i></p>
            <p>Light level: ${plant.lightLevels}</p>
        </div>
        `;

        // This adds the card to your grid on the screen
        cardContainer.innerHTML += allCardsHtml;
    });

    const allCards = document.querySelectorAll(".plant-card");
    const mapElement = document.getElementById('map');

    allCards.forEach(card=>{
        card.addEventListener('click',()=>{

            const plantId = card.getAttribute("data-id");
            const targetMarker = markerMap[plantId];

            if(targetMarker){
                mapElement.scrollIntoView({behavior: 'smooth', block:'center'});

                map.flyTo(targetMarker.getLatLng(),16,{duration:1});

                map.once('moveend', ()=>{
                    markers.zoomToShowLayer(targetMarker,() =>{
                        targetMarker.openPopup();
                    });
                })

            }
        });
    });

    if(isLoggedIn){
        map.on('moveend', () =>{
            filterCardsByMap(map, markerMap);
        })
    }

    map.addLayer(markers)
    filterCardsByMap(map, markerMap);
    return plants;

}

Getplants(map);