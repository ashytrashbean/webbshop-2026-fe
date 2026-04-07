import { getBaseUrl } from "./src/utils/api.js";

const form = document.querySelector("#add-plant-form");
const plantName = document.querySelector("#plant-name");
const plantType = document.querySelector("#plant-type");
const plantImage = document.querySelector("#plant-image");
// const plantLocation = document.querySelector("#plant-location");
const plantTime = document.querySelector("#plant-time");
const brightnessLevel = document.querySelector("#brightnessLevel");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPlant = {
        name: plantName.value.trim(),
        image: plantImage.value.trim(),
        species: plantType.value.trim(),
        lightLevels: brightnessLevel.value,
        ownerId: "65f1a2b3c4d5e6f7a8b9c001",
        coordinates: ["59.858", "17.644"], // Placeholder coordinates
        meetingTime: plantTime.value,
    };

    console.log("Submitting new plant:", newPlant);

    try {
    const response = await fetch(getBaseUrl() + "plants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlant),
    });

    console.log("Status:", response.status);

    const text = await response.text();
    console.log("Response from backend:", text);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    alert("Plant added successfully!");
    form.reset();
    } catch (error) {
        console.error("Error adding plant:", error);
        alert("An error occurred. Please try again.");
    }
});