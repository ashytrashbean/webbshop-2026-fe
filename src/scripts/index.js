export function openPlantModal(plant) {
  document.querySelector("#modal-image").src = plant.image;
  document.querySelector("#modal-name").textContent = plant.name;
  document.querySelector("#modal-water").textContent = "Light Level: " + plant.lightLevels;

  document.querySelector("#plant-modal").classList.remove("hidden");
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