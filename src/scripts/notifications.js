import { getBaseUrl } from "../utils/api.js";

const currentUserId = "65f1a2b3c4d5e6f7a8b9c001";

document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();
});

async function loadNotifications() {
    const container = document.querySelector("#notification-list");
    if (!container) return;
    container.innerHTML = "<p>Loading trades...</p>";

    try {
        const response = await fetch(`${getBaseUrl()}trades`);
        if (!response.ok) {
            throw new Error("Could not fetch trades");
        }
        const trades = await response.json();
        const myTrades = trades.filter(trade =>
        trade.ownerId?._id === currentUserId ||
        trade.requesterId?._id === currentUserId
        );
    
        renderNotifications(myTrades);
    } catch (error) {
        console.error("Error loading notifications:", error);
        container.innerHTML = `<p>Could not load notifications.</p>`;
    }
}

function renderNotifications(trades) {
    const container = document.querySelector("#notification-list");
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
    const requesterId = trade.requesterId?._id;

    const isOwner = ownerId === currentUserId;

    const otherUserName = isOwner
        ? (trade.requesterId?.name || "Unknown user")
        : (trade.ownerId?.name || "Unknown user");

    let actionButtons = "";

    if (isOwner && trade.status === "pending") {
        actionButtons = `
            <div class="notification-actions">
                <button class="accept-btn">Accept</button>
                <button class="reject-btn">Reject</button>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="notification-big-card">
            <div class="notification-img-text">
                <img src="${trade.plantId.image}" alt="${trade.plantId.name}" class="notification-plant-image">
                <div class="notification-text">
                    <h3>${trade.plantId.name}</h3>
                    <p>Owner: <strong>${otherUserName}</strong></p>
                    <p>Status: <span id="status">${trade.status}</span></p>
                    <p>Meeting time: ${new Date(trade.plantId.meetingTime).toLocaleDateString()}</p>
                </div>
            </div>
            ${actionButtons}
        </div>
    `;

    const acceptBtn = card.querySelector(".accept-btn");
    const rejectBtn = card.querySelector(".reject-btn");

    if (acceptBtn) {
        acceptBtn.addEventListener("click", async () => {
            await updateTradeStatus(trade._id, "approved");
            loadNotifications();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener("click", async () => {
            await updateTradeStatus(trade._id, "rejected");
            loadNotifications();
        });
    }
    return card;
}

async function updateTradeStatus(tradeId, newStatus) {
    try {
        const response = await fetch(`${getBaseUrl()}trades/${tradeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            status: newStatus
            })
        });
    
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
    
        if (!response.ok) {
            throw new Error(data?.message || "Could not update trade status");
        }
    
        return data;
    }   catch (error) {
        console.error("Error updating trade:", error);
        alert("Could not update trade: " + error.message);
    }
}