import { getRegionFromCoords } from "./src/utils/api.js";
import { getBaseUrl } from "./src/utils/api.js";

function renderPlantCards(plants){
    const container = document.querySelector("#plant-grid");
    container.innerHTML = "";
    let allCardsHtml = "";

    plants.forEach(plant => {
        allCardsHtml = `
        <div class="plant-card" data-id="${plant._id}">
            <img src="${plant.image}" alt="${plant.name}" height="91px">
            <h4>${plant.name}</h4>
        </div>
        `;
        container.innerHTML += allCardsHtml;
    });
}

async function loadProfile() {
    const userString = localStorage.getItem("userInfo");

    const user = JSON.parse(userString);

    
    document.querySelector(".name").textContent = user.name;
    
    if(user.location && user.location.length === 2){
        const [lat, lon] = user.location;
        
        const regionElement = document.querySelector(".region");
        regionElement.textContent = "Getting region...";
        
        const regionName = await getRegionFromCoords(lat, lon);
        regionElement.textContent = regionName;
    }

    const url = `${getBaseUrl()}users/id/${user._id}`;
    const response = await fetch(url)

    const userProfile = await response.json();

    // Calculate stats from the fetched userProfile
    const listedCount = userProfile.plants.length;
    const pendingCount = userProfile.activeTrades.filter(t => t.status === "pending").length;
    const swappedCount = userProfile.activeTrades.filter(t => t.status === "approved").length;

    document.querySelector("#listed-number").textContent = listedCount;
    document.querySelector("#pending-number").textContent = pendingCount;
    document.querySelector("#swapped-number").textContent = swappedCount;
    
    renderPlantCards(userProfile.plants);
}

loadProfile();

const logoutBtn = document.querySelector("#logoutBtn");

if(logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        sessionStorage.removeItem("accessToken");

        console.log("User logged out successfully");

        window.location.href ="./index.html";
    })
}
