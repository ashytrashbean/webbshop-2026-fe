import { getBaseUrl } from "../utils/api.js";
import { isLoggedIn, getCurrentUserId } from "../utils/auth.js";

export function openPlantModal(plant) {
    if (!isLoggedIn()) {
        alert("You have to be logged in to see this feature!");
        return;
    }

    const modal = document.querySelector("#plant-modal");
    const image = document.querySelector("#modal-image");
    const name = document.querySelector("#modal-name");
    const owner = document.querySelector("#modal-owner");
    const meetingTime = document.querySelector("#modal-time");
    const tradeBtn = document.querySelector("#trade-btn");

    if (!modal || !image || !name || !owner || !tradeBtn) return;

    image.src = plant.image || "";
    image.alt = plant.name || "Plant image";
    name.textContent = plant.name || "Unknown plant";
    owner.textContent = "Owner: " + (plant.ownerId?.name || "Unknown");
    
    if (plant.meetingTime) {
        const formattedMeetingTime = new Date(plant.meetingTime).toLocaleString("sv-SE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

        meetingTime.textContent = "Available for pickup: " + formattedMeetingTime;
    } else {
        meetingTime.textContent = "Available for pickup: Unknown";
    }

    tradeBtn.onclick = async () => {
        await sendTradeRequest(plant);
    };

    modal.classList.remove("hidden");
}

export function initPlantModal() {

    const modal = document.querySelector("#plant-modal");
    const closeBtn = document.querySelector("#close-modal");

    if (!modal) return;

    if (closeBtn) {
        closeBtn.onclick = () => {
            closePlantModal();
        };
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            closePlantModal();
        }
    };
}

export function closePlantModal() {
    const modal = document.querySelector("#plant-modal");
    if (!modal) return;

    modal.classList.add("hidden");
}

async function sendTradeRequest(plant) {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
        alert("You have to be logged in to send a trade request!");
        return;
    }

    const url = `${getBaseUrl()}trades`;

    const requestBody = {
        plantId: plant._id,
        requesterId: currentUserId
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
    
        const text = await response.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = { message: text };
        }
    
        if (!response.ok) {
            throw new Error(data?.message || "Could not send trade request");
        }
    
        alert("Trade request sent successfully!");
        closePlantModal();
    } catch (error) {
        console.error("Error sending trade request:", error);
        alert("Something went wrong while sending the trade request: " + error.message);
    }
}