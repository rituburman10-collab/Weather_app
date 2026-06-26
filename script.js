// OpenWeatherMap API Configuration
const apiKey = "da050210ad875735b493d5b796aeef21"; 

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherInfo = document.getElementById("weather-info");
const errorMsg = document.getElementById("error-msg");

const cityName = document.getElementById("city-name");
const weatherDesc = document.getElementById("weather-desc");
const temperature = document.getElementById("temperature");
const unitDisplay = document.getElementById("unit-display");
const toggleUnitBtn = document.getElementById("toggle-unit-btn");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

let currentTempCelsius = null;
let isCelsius = true;

// Core Function with Auto-Fallback Security Network
async function getWeatherData(city) {
    const primaryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const fallbackUrl = `https://api.weatherapi.com/v1/current.json?key=bc15893d56d7447d95a160840232410&q=${city}`;

    try {
        console.log("Attempting Primary Request for:", city);
        const response = await fetch(primaryUrl);
        
        if (!response.ok) {
            throw new Error("Primary API failed, switching to backup network...");
        }
        
        const data = await response.json();
        
        // Populate standard layout fields
        cityName.innerText = `${data.name}, ${data.sys.country}`;
        weatherDesc.innerText = data.weather[0].description;
        currentTempCelsius = Math.round(data.main.temp);
        humidity.innerText = `${data.main.humidity}%`;
        windSpeed.innerText = `${data.wind.speed} m/s`;
        
        displaySuccess();

    } catch (primaryError) {
        console.warn(primaryError.message);
        
        // Execute Fallback Mechanism seamlessly
        try {
            console.log("Fetching via Backup Stream...");
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (!fallbackResponse.ok) {
                throw new Error("All endpoints exhausted");
            }
            
            const fallbackData = await fallbackResponse.json();
            
            // Sync metadata to align with expectations
            cityName.innerText = `${fallbackData.location.name}, ${fallbackData.location.country}`;
            weatherDesc.innerText = fallbackData.current.condition.text;
            currentTempCelsius = Math.round(fallbackData.current.temp_c);
            humidity.innerText = `${fallbackData.current.humidity}%`;
            windSpeed.innerText = `${Math.round(fallbackData.current.wind_kph / 3.6)} m/s`; // km/h to m/s conversion
            
            displaySuccess();

        } catch (finalError) {
            console.error("Critical Failure:", finalError.message);
            // Show custom error block
            errorMsg.classList.remove("hidden");
            weatherInfo.classList.add("hidden");
        }
    }
}

function displaySuccess() {
    isCelsius = true;
    updateTempUI();
    weatherInfo.classList.remove("hidden"); //
    errorMsg.classList.add("hidden");
}

// C/F Unit Toggle Conversion Mechanics
function updateTempUI() {
    if (isCelsius) {
        temperature.innerText = currentTempCelsius;
        unitDisplay.innerText = "°C";
        toggleUnitBtn.innerText = "Switch to °F";
    } else {
        const tempFahrenheit = Math.round((currentTempCelsius * 9/5) + 32);
        temperature.innerText = tempFahrenheit;
        unitDisplay.innerText = "°F";
        toggleUnitBtn.innerText = "Switch to °C";
    }
}

// Trigger Implementations
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city !== "") getWeatherData(city);
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city !== "") getWeatherData(city);
    }
});

toggleUnitBtn.addEventListener("click", () => {
    if (currentTempCelsius !== null) {
        isCelsius = !isCelsius;
        updateTempUI();
    }
});