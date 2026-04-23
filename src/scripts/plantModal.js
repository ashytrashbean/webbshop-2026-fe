import { getBaseUrl, smartFetch } from "../utils/api.js";
import { isLoggedIn, getCurrentUserId } from "../utils/auth.js";

export function openPlantModal(plant) {
    if (!isLoggedIn()) {
        Toastify({
            text: "Join the community to see details and trade plants",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #4CAF50, #81C784)",
                color: "#fff",
            }
        }).showToast();
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
        Toastify({
            text: "Join the community to see details and trade plants",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #4CAF50, #81C784)",
                color: "#fff",
            }
        }).showToast();
        return;
    }

    const requestBody = {
        plantId: plant._id,
        requesterId: currentUserId
    };

    try {
        const response = await smartFetch(`trades`, {
            method: "POST",
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

        Toastify({
            text: "Trade request sent successfully!",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #4CAF50, #81C784)",
                color: "#fff",
            }
        }).showToast();
        closePlantModal();
    } catch (error) {
        console.error("Error sending trade request:", error);
        Toastify({
            text: "Oops! Something went wrong..." + (error.message ? ` (${error.message})` : ""),
            duration: 3000,
            style: {
                background: "#d32f2f"
            }
        }).showToast();
    }
}