/**
 * @file fetchOfficialStations.js
 * @brief This file contains the code to fetch the official stations
 * data from the WAQI API and display it on the map.
 *
 * @description This file is imported from a CDN. It's in the repository only for reference.
 * @author Manuel Borregales
 */

/**
 * Retrieves AQI (Air Quality Index) information based on its value.
 *
 * @param {number} aqi - The AQI value.
 * @returns {Object} - An object containing the color and text corresponding to the AQI.
 */
function getAQIInfo(aqi) {
    if (aqi <= 50) {
        // Green: AQI <= 50 (Good air quality)
        return { color: '#35B765', text: 'Limpio' };
    }
    if (aqi <= 100) {
        // Yellow: 50 < AQI <= 100 (Moderate air quality)
        return { color: '#E5B41C', text: 'Moderado' };
    }
    if (aqi <= 200) {
        // Red: 100 < AQI <= 200 (Unhealthy air quality)
        return { color: '#E24C4C', text: 'Insalubre' };
    }
    // Purple: AQI > 200 (Hazardous air quality)
    return { color: '#EF5CDD', text: 'Peligroso' };
}

/**
 * Creates a custom HTML marker for a given AQI value.
 *
 * @param {number} aqi - The AQI value.
 * @returns {L.DivIcon} - A Leaflet DivIcon object representing the custom marker.
 */
function createCustomMarker(aqi) {
    const color = getAQIInfo(aqi).color;
    const text = getAQIInfo(aqi).text;

    const svgIcon = `
        <img src="https://res.cloudinary.com/dcup5oalu/image/upload/v1733928181/assets/antenna-icon.svg" 
            alt="Icon" 
            class="marker-svg-icon" style="color:#ffffff"/>`;

    const iconHtml = `
        <div class="custom-marker" style="--marker-bg-color: ${color};
                                          --marker-text-color: "white">
            <div style="margin-top:auto">${svgIcon}</div>
            <div style="color:#ffffff">${text}</div>
        </div>`;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-wrapper',
    });
}

/**
 * Fetches official station data from the WAQI API and displays it on the map.
 *
 * @param {L.LayerGroup} officialStationsLayer - The Leaflet layer group to which markers will be added.
 * @param {string} token - The WAQI API token for authentication.
 * @param {L.Map} map - The Leaflet map object where the stations will be displayed.
 */
function fetchOfficialStations(officialStationsLayer, token, map) {
    fetch(
        `https://api.waqi.info/map/bounds/?latlng=39.4,-0.6,39.6,-0.2&token=${token}`
    )
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 'ok') {
                data.data.forEach((station) => {
                    const aqi = station.aqi;
                    const latitude = station.lat;
                    const longitude = station.lon;
                    const aqiInfo = getAQIInfo(aqi); // Retrieve AQI info here
                    const text = aqiInfo.text; // Get the text again

                    // Create a marker with the custom color for each official station
                    const marker = L.marker([latitude, longitude], {
                        icon: createCustomMarker(aqi),
                    })
                        .addTo(officialStationsLayer)
                        .bindPopup(
                            `Estación: ${station.station.name}<br> AQI: ${aqi}<br> Calidad del aire: ${text}`
                        );
                });
            } else {
                console.log("Couldn't obtain the official stations data");
            }
        })
        .catch((error) => console.error('Error fetching WAQI data:', error));

    officialStationsLayer.addTo(map);
}

// Export the function for use in HTML
export { fetchOfficialStations };
