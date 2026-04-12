import { getBaseUrl } from "../utils/api.js";

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
    requesterId: "65f1a2b3c4d5e6f7a8b9c002"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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

document.getElementById("close-modal").onclick = () => {
  document.getElementById("plant-modal").classList.add("hidden");
};

document.getElementById("plant-modal").onclick = (e) => {
  if (e.target.id === "plant-modal") {
    document.getElementById("plant-modal").classList.add("hidden");
  }
};


// GET NOTIFICATIONS
async function checkForTradeRequests() {
  const url = `${getBaseUrl()}trades`;
  try {
    const res = await fetch(url);
    const trades = await res.json();

    const currentUserId = "65f1a2b3c4d5e6f7a8b9c001"; // owner (t.ex. Amara)

    const incomingRequests = trades.filter(trade => {
      return (
        trade.ownerId._id === currentUserId &&
        trade.status === "pending"
      );
    });

    if (incomingRequests.length > 0) {
      const firstRequest = incomingRequests[0];

      alert(
        `${firstRequest.requesterId.name} wants your plant ${firstRequest.plantId.name}`
      );
    }
  } catch (error) {
    console.error("Error fetching trades:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkForTradeRequests();
});