import { getBaseUrl } from "../utils/api.js";
let selectedTrade = null;


// OPEN PLANT MODAL — MORE INFO (from index.html)
export function openPlantModal(plant, currentUser) {
  document.querySelector("#modal-image").src = plant.image;
  document.querySelector("#modal-name").textContent = plant.name;
  document.querySelector("#modal-water").textContent = "Light Level: " + plant.lightLevels;
  document.querySelector("#modal-owner").textContent = "Owner: " + plant.ownerId.name;
  document.querySelector("#modal-date").textContent = "Meeting Time: " + new Date(plant.meetingTime).toLocaleDateString();

  document.querySelector("#plant-modal").classList.remove("hidden");

  document.querySelector("#trade-btn").onclick = () => {
    sendTradeRequest(plant, currentUser);
  };
}


// SEND TRADE REQUEST 
export async function sendTradeRequest(plant, currentUser) {
  const url = `${getBaseUrl()}trades`;

  const requestBody = {
    plantId: plant._id,
    requesterId: "65f1a2b3c4d5e6f7a8b9c002" // Kim Nguyen
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || "Could not send trade request");
    }

    alert("Trade request sent successfully!");
  } catch (error) {
    alert("Something went wrong while sending the trade request: " + error.message);
  }
}

// CLOSE PLANT MODAL
document.querySelector("#close-modal").onclick = () => {
  document.querySelector("#plant-modal").classList.add("hidden");
};
document.querySelector("#plant-modal").onclick = (e) => {
  if (e.target.id === "plant-modal") {
    document.querySelector("#plant-modal").classList.add("hidden");
  }
};


// UPDATE TRADE STATUS
async function updateTradeStatus(tradeId, newStatus) {
  const url = `${getBaseUrl()}trades/${tradeId}`;

  try {
    const response = await fetch(url, {
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
  } catch (error) {
    console.error("Error updating trade:", error);
    alert("Could not update trade: " + error.message);
  }
}


// ACCEPT OR DECLINE TRADE
document.querySelector("#accept-btn").onclick = async () => {
  if (!selectedTrade) return;

  await updateTradeStatus(selectedTrade._id, "approved");

  alert("Trade accepted!");
  document.querySelector("#notification-modal").classList.add("hidden");
};

document.querySelector("#decline-btn").onclick = async () => {
  if (!selectedTrade) return;

  await updateTradeStatus(selectedTrade._id, "cancelled");

  alert("Trade cancelled!");
  document.querySelector("#notification-modal").classList.add("hidden");
};


// OPEN NOTIFICATION MODAL
function openNotificationModal(trade) {
  const modal = document.querySelector("#notification-modal");
  const message = document.querySelector("#notification-message");

  if (!modal || !message) return;

  message.textContent = `${trade.requesterId.name} wants your plant ${trade.plantId.name}`;
  modal.classList.remove("hidden");
}

// CLOSE NOTIFICATION MODAL
document.querySelector("#close-notification-modal").onclick = () => {
  document.querySelector("#notification-modal").classList.add("hidden");
};


// CHECK FOR INCOMING TRADE REQUESTS
async function checkForTradeRequests() {
  const url = `${getBaseUrl()}trades`;

  try {
    const response = await fetch(url);
    const trades = await response.json();

    const currentUserId = "65f1a2b3c4d5e6f7a8b9c001"; // Amara Okafor

    const incomingRequests = trades.filter(trade =>
      trade.ownerId._id === currentUserId &&
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

// UPDATE ON PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
  checkForTradeRequests();
});
