export function getBaseUrl() {
  if (window.location.hostname.includes("localhost") && false) { // Kommentera ut för att komma åt lokal server igen
    return "http://localhost:3000/";
  }
  return "https://webbshop-2026-be-grupp-2.vercel.app/"; // Er backend-rotadress
}

export async function smartFetch(endpoint, options ={}) {

    const accessToken = sessionStorage.getItem("accessToken");
    options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
        "Authorization": accessToken ? `Bearer ${accessToken}` : ""
    };

  let response = await fetch(`${getBaseUrl()}${endpoint}`, options);

  if(response. status === 401) {
    console.warn("Acess token expired. Attempting to refresh...");

    const newAccessToken = await refreshMyToken();

    if(newAccessToken){
      options.headers["Authorization"] = `Bearer ${newAccessToken}`;
      response = await fetch(`${getBaseUrl()}${endpoint}`, options)
    } else {
      console.error("Session expired. Redirecting to login.");
      window.location.href = "./userLogin.html";
      return;
    }
  }
  return response;
}

async function refreshMyToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await fetch(`${getBaseUrl()}auth/refresh`,{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({refreshToken})
  });

  if(response.ok){
    const data = await response.json();
    sessionStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  }

  return null
}

export async function  getRegionFromCoords(lat, lon) {
  try{
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    const data = await response.json();

    const address = data.address;
    return address.city || address.town || address.village || address.county || "Unknown Region";
    
  }catch(error){
    console.error("Geocoding failed:", error);
    return "Region unavailable";
  }
}