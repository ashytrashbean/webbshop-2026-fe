import { getBaseUrl, smartFetch } from "./src/utils/api.js";

const form = document.querySelector("#add-plant-form");
const plantName = document.querySelector("#plant-name");
const plantType = document.querySelector("#plant-type");
const plantImage = document.querySelector("#plant-image");
const plantTime = document.querySelector('input[type="datetime-local"]');
const brightnessLevel = document.querySelector("#brightnessLevel");

const userInfo = JSON.parse(localStorage.getItem("userInfo"));

if (!userInfo) {
    window.location.href = "./userLogin.html";
}

const currentUserId = userInfo._id;

let pinIcon = L.icon({
    iconUrl: './images/pin-logo.png',

    iconSize:     [38, 50], // size of the icon
    iconAnchor:   [19, 50], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

// inside the setView([latitude, longitude], map view distance)
const map =L.map('map').setView([61.52, 12.74], 4);
let selectCoordinates = [61.52, 12.74];
let currentManualMarker = null;

// This is purely the map object itself
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Creates the search function
// L.Control.geocoder().addTo(map);

const mockLibraries = [
    {
        city: "Stockholm",
        library: "Stockholm Public Library (Asplundhuset)",
        coordinates:[59.3434,18.0543]
    },
    {
        city: "Stockholm",
        library: "National Library of Sweden (Kungliga bibl.)",
        coordinates:[59.3384, 18.0722]
    },
    {
        city: "Uppsala",
        library: "Uppsala Public Library",
        coordinates:[59.8604, 17.6366]
    },
    {
        city: "Uppsala",
        library: "Carolina Rediviva (Uppsala University)",
        coordinates:[59.8549, 17.6311]
    },
    {
        city: "Västerås",
        library: "Västerås City Library",
        coordinates:[59.6119, 16.5448]
    },
]


const cityDropdown = document.querySelector("#lib-city");
const libDropdown = document.querySelector("#lib");


cityDropdown.addEventListener("change", (e)=>{
    const selectedCity = e.target.value;
    libDropdown.innerHTML = '<option value="" disabled selected>Library</option>';
    
    // Makes map focus on the city area (its targeting the first pin coordinates and showing a zoomed out view)
    const filtered = mockLibraries.filter(l => l.city === selectedCity);
    if(filtered.length >0){
        const cityFocus = filtered[0].coordinates;
        map.flyTo(cityFocus, 12);
    }
    
    // Gives the library a dropdown that is dependant on which objects have the same city, then makes an list of options with their library names
    filtered.forEach(l => {
        const opt = document.createElement("option");
        opt.value = JSON.stringify(l.coordinates);
        opt.textContent = l.library;
        libDropdown.appendChild(opt);
    });
});

libDropdown.addEventListener('change', (e) => {
    const coords = JSON.parse(e.target.value);
    selectCoordinates = coords;
    map.flyTo(coords, 15)
});

function manualLocation(latlng){
    const coords = [latlng.lat, latlng.lng];
    selectCoordinates = coords;
    cityDropdown.value = "";
    libDropdown.value = "";
    
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

function GetMeetups(map){
    const markers = new L.MarkerClusterGroup();
    const markerMap= {};

    mockLibraries.forEach(biblio =>{
        const marker = L.marker(biblio.coordinates, {icon: pinIcon});

        marker.bindPopup(`<b>${biblio.library}</b>`)
        markers.addLayer(marker);
        markerMap[biblio.library] = marker;
    })

    map.addLayer(markers)
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const newPlant = {
        name: plantName.value.trim(),
        image: plantImage.value.trim(),
        species: plantType.value.trim(),
        lightLevels: brightnessLevel.value,
        ownerId: currentUserId,
        coordinates: selectCoordinates, 
        meetingTime: plantTime.value,
    };
    
    try {
        const response = await smartFetch("plants", {
            method: "POST",
            body: JSON.stringify(newPlant),
        });
        
        console.log("Status:", response.status);
        
        const text = await response.text();
        console.log("Response from backend:", text);
        
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        
        Toastify({
            text: "Plant added successfully!",
            duration: 3000,
            gravity: "top",
            position: "right",
            style : {
                background: "linear-gradient(to right, #4CAF50, #81C784)",
                color: "#fff",
            }
        }).showToast();
        
        form.reset();
    } catch (error) {
        console.error("Error adding plant:", error);
        Toastify({
            text: "Oops! Something went wrong...",
            duration: 4000,
            style: {
                background: "#d32f2f"
            }
        }).showToast();
    }
});

GetMeetups(map);