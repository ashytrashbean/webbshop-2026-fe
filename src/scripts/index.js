import { getBaseUrl } from "../utils/api.js";

// PLANT MODAL — MORE INFO OPEN
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
    ownerId: plant.ownerId?._id || plant.ownerId,
    requesterId: currentUser?._id || "demo-user-123",
    meetingTime: plant.meetingTime,
    status: "pending"
  };

  try {
    console.log("POST URL:", url);
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

// CLOSE BUTTON
document.getElementById("close-modal").onclick = () => {
  document.getElementById("plant-modal").classList.add("hidden");
};

// CLOSE WHEN CLICKING OUTSIDE
document.getElementById("plant-modal").onclick = (e) => {
  if (e.target.id === "plant-modal") {
    document.getElementById("plant-modal").classList.add("hidden");
  }
};