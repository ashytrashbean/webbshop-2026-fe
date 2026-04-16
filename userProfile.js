import { getRegionFromCoords } from "./src/utils/api.js";


async function loadProfile() {
    const userString = localStorage.getItem("userInfo");

    if(userString){
        const user = JSON.parse(userString);
        document.querySelector(".name").textContent = user.name;

        if(user.location && user.location.length === 2){
            const [lat, lon] = user.location;

            const regionElement = document.querySelector(".region");
            regionElement.textContent = "Getting region...";

            const regionName = await getRegionFromCoords(lat, lon);
            regionElement.textContent = regionName;
        }
    } 
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
