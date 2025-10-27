import React, { useEffect, useState } from "react";
import "./Home.css";
import axios from "axios";
import LocationScreen from "../Constants/Maps";

function Home() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [clickedWeather, setClickedWeather] = useState(null);
  const [currentPrediction, setCurrentPrediction] = useState({ flood: "", landslide: "" });
  const [clickedPrediction, setClickedPrediction] = useState({ flood: "", landslide: "" });
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [district, setDistrict] = useState("Unknown");
  const [state, setState] = useState("Unknown");

  useEffect(() => {
    if (clickedLocation && !currentLocation) {
      setCurrentLocation(clickedLocation);
    }
  }, [clickedLocation]);

  useEffect(() => {
    if (currentLocation) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          const address = data.address;
          const districtName = address.city_district || address.county || address.suburb || "Unknown";
          const stateName = address.state || "Unknown";
          console.log("📍 Current District:", districtName);
          console.log("🗺️ Current State:", stateName);
  
          fetchWeather(currentLocation, setCurrentWeather, setCurrentPrediction, districtName, stateName);
        })
        .catch(err => console.error("Error fetching current location district/state:", err));
    }
  }, [currentLocation]);

  useEffect(() => {
    if (clickedLocation) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${clickedLocation.lat}&lon=${clickedLocation.lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          const address = data.address;
          const districtName = address.city_district || address.county || address.suburb || "Unknown";
          const stateName = address.state || "Unknown";
          console.log("📍 District:", districtName);
          console.log("🗺️ State:", stateName);
          setDistrict(districtName);
          setState(stateName);

          fetchWeather(clickedLocation, setClickedWeather, setClickedPrediction, districtName, stateName);
        })
        .catch(err => console.error("Error fetching district/state:", err));
    }
  }, [clickedLocation]);

  const fetchWeather = async (location, setWeather, setPrediction, districtName, stateName) => {
    try {
      const apiKey = "FvWrmQZWwEmpgFCd2BMyJVthCHMpW8rW";
      const response = await axios.get("https://api.tomorrow.io/v4/weather/realtime", {
        params: {
          location: `${location.lat},${location.lng}`,
          apikey: apiKey,
        },
      });

      const weather = response.data.data.values;
      setWeather(weather);

      getPredictions(weather, setPrediction, districtName, stateName, location.lat, location.lng);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError("Failed to fetch weather data.");
    }
  };

  const getPredictions = async (weather, setPrediction, districtName, stateName, lat, lng) => {
    try {
      // Step 1: Get elevation
      const elevationRes = await axios.get(`https://www.gomaps.pro/maps/api/elevation/json`, {
        params: {
          locations: `${lat},${lng}`,
          key: "AlzaSyjnj4rZlwIUt6mFkgbIOJ1Jh7TT38lv-SG"
        }
      });
  
      const elevation = elevationRes.data.results?.[0]?.elevation || 0;
      console.log("📏 Elevation:", elevation);
  
      // Step 2: Send weather + elevation + location to backend
      const response = await axios.post("https://backend-1k0p.onrender.com", {
        weather: [weather.rainIntensity, weather.humidity, weather.windSpeed],
        elevation: elevation,
        district: districtName,
        state: stateName,
      });
  
      setPrediction({
        flood: response.data.prediction1,
        landslide: response.data.prediction2,
      });
    } catch (error) {
      console.error("Error getting predictions or elevation:", error);
      setError(" ");
    }
  };
  

  const renderWeatherInfo = (weather, prediction, title) => (
    <div className="weather-section">
      <h2>{title}</h2>
      {weather ? (
        <div>
          <p><strong>RainFall:</strong> {weather.rainIntensity}</p>
          <p><strong>Humidity:</strong> {weather.humidity}%</p>
          <p><strong>Wind Speed:</strong> {weather.windSpeed} km/h</p>
          <h3><strong>FLOOD:</strong> {prediction.flood === "1" ? "DANGER" : "SAFE"}</h3>
          <h3><strong>LANDSLIDE:</strong> {parseFloat(prediction.landslide) >= 0.9 ? "DANGER" : "SAFE"}</h3>
        </div>
      ) : <p>Loading weather data...</p>}
    </div>
  );

  return (
    <div className="Container">
      <h1>Weather-Based ML Prediction</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="weather-container">
        {renderWeatherInfo(currentWeather, currentPrediction, "Current Location")}
        {renderWeatherInfo(clickedWeather, clickedPrediction, "Selected Location")}
      </div>

      <LocationScreen setLocation={setClickedLocation} />
    </div>
  );
}

export default Home;
