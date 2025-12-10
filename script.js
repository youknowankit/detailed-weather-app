const apiKey = "bfa111a9624edbd98655f2ae5cd01081"; // Replace with your OpenWeather API key
let currentWeatherData = null; // Store current weather data for details
let showingDetails = false;

function displayBasicWeather() {
  const weatherResult = document.getElementById("weatherResult");
  const data = currentWeatherData;
  const icon = data.weather[0].icon;

  weatherResult.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${data.weather[0].description}">
    <p><strong>${data.main.temp}°C</strong></p>
    <p style="text-transform: capitalize;">${data.weather[0].description}</p>
  `;
}

function displayDetailedWeather() {
  const weatherResult = document.getElementById("weatherResult");
  const data = currentWeatherData;

  weatherResult.innerHTML = `
    <div class="weather-details">
      <div class="detail-item">
        <i class="fas fa-temperature-high"></i>
        <div>
          <span class="detail-label">Feels Like</span>
          <span class="detail-value">${data.main.feels_like}°C</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-temperature-low"></i>
        <div>
          <span class="detail-label">Min Temp</span>
          <span class="detail-value">${data.main.temp_min}°C</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-temperature-high"></i>
        <div>
          <span class="detail-label">Max Temp</span>
          <span class="detail-value">${data.main.temp_max}°C</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-tint"></i>
        <div>
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${data.main.humidity}%</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-compress-alt"></i>
        <div>
          <span class="detail-label">Pressure</span>
          <span class="detail-value">${data.main.pressure} hPa</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-wind"></i>
        <div>
          <span class="detail-label">Wind Speed</span>
          <span class="detail-value">${data.wind.speed} m/s</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-eye"></i>
        <div>
          <span class="detail-label">Visibility</span>
          <span class="detail-value">${(data.visibility / 1000).toFixed(
            1
          )} km</span>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-cloud"></i>
        <div>
          <span class="detail-label">Cloudiness</span>
          <span class="detail-value">${data.clouds.all}%</span>
        </div>
      </div>
    </div>
  `;
}

// Main function to get weather by city name
async function getWeatherByCity(city) {
  const weatherResult = document.getElementById("weatherResult");
  const detailsBtn = document.getElementById("detailsBtn");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    weatherResult.innerHTML =
      '<p class="loading-text">Loading weather data...</p>';
    detailsBtn.style.display = "none";

    const response = await fetch(url);
    data = await response.json();

    // Check for API-level errors (like city not found)
    if (data.cod && data.cod.toString() !== "200") {
      console.log(data.message);
      throw new Error(data.message || "City not found");
    }

    //HTTP Errors:
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    currentWeatherData = data;
    displayBasicWeather();
    detailsBtn.style.display = "block";
    showingDetails = false;
  } catch (error) {
    console.error("Error:", error);
    let errorMessage = "Something went wrong. Try again.";

    if (error.message.toLowerCase().includes("city not found")) {
      errorMessage = "City not found. Try again.";
    } else if (error.message.includes("HTTP")) {
      errorMessage = "Weather service unavailable. Try later.";
    }

    weatherResult.innerHTML = ` 
      <p style="color:red;">
        ${errorMessage}
      </p>`;
    detailsBtn.style.display = "none";
  }
}

// 🔍 Get city name using latitude and longitude (Reverse Geocoding)
async function getCityFromCoordinates(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data && data.length > 0) {
    // return data[0].name;
    /*data[0].name sometimes cause error when location is not a city rather a local location like "karol bagh tehsil" or "civil lines" */
    return data[0].state;
  } else {
    throw new Error("City not found from coordinates.");
  }
}

// Called when user clicks "Get Weather" button
function getWeather() {
  const cityInput = document.getElementById("cityInput").value.trim();
  if (cityInput) {
    getWeatherByCity(cityInput);
  } else {
    document.getElementById("weatherResult").innerHTML =
      '<p style="color:red;">Please enter a city name.</p>';
  }
}

// Add Enter key listener to the input field
document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeather(); // Trigger search on Enter key
  }
});

// Get weather by user’s current location
function getWeatherByLocation() {
  const weatherResult = document.getElementById("weatherResult");
  weatherResult.innerHTML =
    '<p style="color:#2563eb;">Detecting your location...</p>';

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const city = await getCityFromCoordinates(lat, lon);
          getWeatherByCity(city);
        } catch (err) {
          console.error("Error getting city from location:", err);
          weatherResult.innerHTML =
            '<p style="color:red;">Failed to get city from location.</p>';
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        weatherResult.innerHTML =
          '<p style="color:red;">Location access denied.</p>';
      }
    );
  } else {
    weatherResult.innerHTML =
      '<p style="color:red;">Geolocation not supported by your browser.</p>';
  }
}

function toggleDetails() {
  const detailsBtn = document.getElementById("detailsBtn");

  if (showingDetails) {
    displayBasicWeather();
    detailsBtn.innerHTML = '<i class="fas fa-info-circle"></i> Show Details';
  } else {
    displayDetailedWeather();
    detailsBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Summary';
  }

  showingDetails = !showingDetails;
}
