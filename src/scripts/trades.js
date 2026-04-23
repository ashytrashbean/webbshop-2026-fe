import { getBaseUrl, smartFetch } from "../utils/api.js";
import { getCurrentUserId } from "../utils/auth.js";

let selectedTrade = null;

export async function sendTradeRequest(plant) {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
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
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            throw new Error(data?.message || "Could not send trade request");
        }

        Toastify({
            text: "Trade request sent successfully!",
            duration: 2000,
            gravity: "top",
            position: "center",
            style : {
                background: "linear-gradient(to right, #4CAF50, #81C784)",
                color: "#fff",
            }
        }).showToast();

    } catch (error) {
        Toastify({
            text: "Oops! Something went wrong..." + (error.message ? ` (${error.message})` : ""),
            duration: 3000,
            style: {
                background: "#d32f2f"
            }
        }).showToast();
    }
}

async function updateTradeStatus(tradeId, newStatus) {

    try {
        const response = await smartFetch(`trades/${tradeId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus })
        });
    
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
    
        if (!response.ok) {
            throw new Error(data?.message || "Could not update trade status");
        }
    
        return data;
    } catch (error) {
        console.error("Error updating trade:", error);
        Toastify({
            text: "Oops! Something went wrong..." + (error.message ? ` (${error.message})` : ""),
            duration: 3000,
            style: {
                background: "#d32f2f"
            }
        }).showToast();
    }
}

function openNotificationModal(trade) {
    const modal = document.querySelector("#notification-modal");
    const message = document.querySelector("#notification-message");

    if (!modal || !message) return;

    message.textContent = `${trade.requesterId.name} wants your plant ${trade.plantId.name}`;
    modal.classList.remove("hidden");
}

export async function checkForTradeRequests() {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
        const response = await smartFetch(`trades`, {
            method: "GET",
        }); 
        const trades = await response.json();
        
        const incomingRequests = trades.filter(trade =>
            trade.ownerId?._id === currentUserId &&
            trade.status === "pending"
        );
    
        if (incomingRequests.length > 0) {
            selectedTrade = incomingRequests[0];
            openNotificationModal(selectedTrade);
        }
    } catch (error) {
        console.error("Error fetching trades:", error);
    }
}

export function initTradeModals() {
    const closeNotificationBtn = document.querySelector("#close-notification-modal");
    const acceptBtn = document.querySelector("#accept-btn");
    const completeBtn = document.querySelector("#complete-btn");
    const declineBtn = document.querySelector("#decline-btn");
    const notificationModal = document.querySelector("#notification-modal");

    if (closeNotificationBtn) {
        closeNotificationBtn.onclick = () => {
            notificationModal?.classList.add("hidden");
        };
    }

    if (acceptBtn) {
        acceptBtn.onclick = async () => {
            if (!selectedTrade) return;
            
            await updateTradeStatus(selectedTrade._id, "approved");
            Toastify({
                text: "Trade approved!",
                duration: 2000,
                gravity: "top",
                position: "center",
                style : {
                    background: "linear-gradient(to right, #4CAF50, #81C784)",
                    color: "#fff",
                }
            }).showToast();

            notificationModal?.classList.add("hidden");
        };
    }

    if (completeBtn) {
        completeBtn.onclick = async () => {
            if (!selectedTrade) return;
            
            await updateTradeStatus(selectedTrade._id, "completed");
            Toastify({
                text: "Trade Completed!",
                duration: 2000,
                gravity: "top",
                position: "center",
                style : {
                    background: "linear-gradient(to right, #4CAF50, #81C784)",
                    color: "#fff",
                }
            }).showToast();

            notificationModal?.classList.add("hidden");
        };
    }

    if (declineBtn) {
        declineBtn.onclick = async () => {
            if (!selectedTrade) return;
            
            await updateTradeStatus(selectedTrade._id, "cancelled");
            Toastify({
            text: "Trade cancelled",
            duration: 3000,
            style: {
                background: "#d32f2f"
            }
        }).showToast();
            notificationModal?.classList.add("hidden");
        };
    }
}