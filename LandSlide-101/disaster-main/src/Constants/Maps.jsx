import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const LocationScreen = ({ setLocation, prediction }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [markerLocation, setMarkerLocation] = useState(null);
  const [isGomapsLoaded, setIsGomapsLoaded] = useState(false);
  const [clickState, setClickState] = useState(0); // 0 = First click, 1 = Second click

  const gomapsApiKey = "AlzaSyjnj4rZlwIUt6mFkgbIOJ1Jh7TT38lv-SG";// Replace with actual API key

  const loadGomapsScript = () => {
    const script = document.createElement("script");
    script.src = `https://maps.gomaps.pro/maps/api/js?v=3.exp&libraries=places&key=${gomapsApiKey}`;
    script.onload = () => setIsGomapsLoaded(true);
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadGomapsScript();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setMarkerLocation(newLocation);
          setLocation(newLocation);
        },
        (error) => {
          console.error("Error fetching location:", error.message);
          alert("Unable to fetch location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleMapClick = (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
    const newMarkerLocation = { lat: clickedLat, lng: clickedLng };
  
    // Move the marker on every click
    setMarkerLocation(newMarkerLocation);
    setLocation(newMarkerLocation);
  
    if (clickState === 1) {
      if (prediction === "0" && userLocation) {
        // Open Google Maps directions
        const mapsUrl = `https://www.gomaps.pro/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${clickedLat},${clickedLng}&travelmode=driving`;
        window.open(mapsUrl, "_blank");
  
        // Reset clickState after opening maps
        setClickState(0);
      } 
    } else {
      // Set clickState to 1 after first click
      setClickState(1);
    }
  };
  
  

  if (!isGomapsLoaded) return <div>Loading Maps...</div>;

  return (
    <div style={mapContainerStyle}>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={10} center={userLocation} onClick={handleMapClick}>
        {userLocation && <Marker position={userLocation} label="You" />}
        {markerLocation && (
          <Marker
            position={markerLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/kml/paddle/grn-blank.png",
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default LocationScreen;
