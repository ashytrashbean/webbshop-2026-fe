import { getBaseUrl } from "../utils/api.js";
import { requireAuth, getCurrentUserId } from "../utils/auth.js";
import { smartFetch } from "../utils/api.js";

requireAuth();

const currentUserId = getCurrentUserId();
const token = sessionStorage.getItem("accessToken");

document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();
});

async function loadNotifications() {
    const container = document.querySelector("#notification-list");
    if (!container) return;

    container.innerHTML = "<p>Loading trades...</p>";

    try {
        
        const response = await smartFetch(`trades/mine`,{
            method: "GET",
        }); 

        if (!response.ok) {
            throw new Error("Could not fetch trades");
        }

        const trades = await response.json();

        renderNotifications(trades);
    } catch (error) {
        console.error("Error loading notifications:", error);
        container.innerHTML = "<p>Could not load notifications.</p>";
    }
}

function renderNotifications(trades) {
    const container = document.querySelector("#notification-list");
    if (!container) return;

    container.innerHTML = "";

    if (trades.length === 0) {
        container.innerHTML = "<p>No trades yet.</p>";
        return;
    }

    trades.forEach(trade => {
        const card = createTradeCard(trade);
        container.appendChild(card);
    });
}

function createTradeCard(trade) {
    const card = document.createElement("article");
    card.className = "notification-card";

    const ownerId = trade.ownerId?._id;
    const isOwner = ownerId === currentUserId;

    const cardTypeClass = isOwner ? "incoming" : "outgoing";

        // NEW: status class
        let statusClass = "";

        if (trade.status === "approved") {
            statusClass = "status-approved";
        } else if (trade.status === "completed") {
            statusClass = "status-completed";
        }
    const tradeTypeText = isOwner ? "Incoming request!" : "My request";
    const personLabel = isOwner ? "Requested by" : "Owner";

    const otherUserName = isOwner
        ? (trade.requesterId?.name || "Unknown user")
        : (trade.ownerId?.name || "Unknown user");

    let actionButtons = "";

    if (trade.status !== "completed") {
        actionButtons = `
            <div class="notification-actions">
                <button class="reject-btn">Cancel</button>
            </div>
        `;
    } 
    
    if(isOwner && trade.status === "pending"){
        actionButtons = `
        <div class="notification-actions">
            <button class="accept-btn">Accept</button>
            <button class="reject-btn">Reject</button>
        </div>
        `;  
    } else if(isOwner && trade.status === "approved"){
        actionButtons = `
            <div class="notification-actions">
                <button class="complete-btn">Complete</button>
                <button class="reject-btn">Cancel</button>
            </div>
        `;        
    }

    card.innerHTML = `
        <div class="notification-big-card ${cardTypeClass} ${statusClass}">
            <p class="trade-type">${tradeTypeText}</p>

            <div class="notification-img-text">
                <img src="${trade.plantId?.image || ""}" alt="${trade.plantId?.name || "Plant"}" class="notification-plant-image">

                <div class="notification-text">
                    <h3>${trade.plantId?.name || "Unknown plant"}</h3>
                    <p>${personLabel}: <strong>${otherUserName}</strong></p>
                    <p>Status: <span class="status">${trade.status}</span></p>
                    <p>Meeting time: ${
                        trade.plantId?.meetingTime
                            ? new Date(trade.plantId.meetingTime).toLocaleString([], {
                                year: 'numeric', 
                                month: 'numeric', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit'})
                            : "Not set"
                    }</p>
                </div>
            </div>

            ${actionButtons}
        </div>
    `;

    const acceptBtn = card.querySelector(".accept-btn");
    const completeBtn = card.querySelector(".complete-btn");
    const rejectBtn = card.querySelector(".reject-btn");

    if (acceptBtn) {
        acceptBtn.addEventListener("click", async () => {
            await updateTradeStatus(trade._id, "approved");
            loadNotifications();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener("click", async () => {
            await updateTradeStatus(trade._id, "cancelled");
            loadNotifications();
        });
    }

    if (completeBtn) {
        completeBtn.addEventListener("click", async () => {
            await updateTradeStatus(trade._id, "completed");
            loadNotifications();
        });
    }

    return card;
}

async function updateTradeStatus(tradeId, newStatus) {
    const url = `trades/${tradeId}/status`;

    try {
        const response = await smartFetch(url, {
            method: "PATCH",
            body: JSON.stringify({
            status: newStatus.trim()
            })
        });

        const text = await response.text();

        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = { message: text };
        }

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("Error updating trade:", error);
        Toastify({
            text: "Oops! Something went wrong..." + error.message,
            duration: 4000,
            style: {
                background: "#d32f2f"
            }
        }).showToast();
    }
}