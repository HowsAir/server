/**
 * @file fetchOfficialStations.js
 * @brief This file contains the code to fetch the official stations
 * data from the WAQI API and display it on the map.
 *
 * @description This file is imported from a CDN. It's in the repository only for reference.
 * @author Manuel Borregales
 */

// import { response } from 'express';

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
 * @author Manuel Borregales
 * 
 * @param {L.LayerGroup} officialStationsLayer - The Leaflet layer group to which markers will be added.
 * @param {string} token - The WAQI API token for authentication.
 * @param {L.Map} map - The Leaflet map object where the stations will be displayed.
 */
async function fetchOfficialStations(officialStationsLayer, token, map) {
    try {
        const response = await fetch(
            `https://api.waqi.info/map/bounds/?latlng=39.4,-0.6,39.6,-0.2&token=${token}`
        );
        const data = await response.json();

        if (data.status === 'ok') {
            for (const station of data.data) {
                const aqi = station.aqi;
                const latitude = station.lat;
                const longitude = station.lon;
                const aqiInfo = getAQIInfo(aqi); // Retrieve AQI info here
                const text = aqiInfo.text; // Get the text again

                // Wait for the station data to be fetched
                const stationData = await fetchStationData(
                    latitude,
                    longitude,
                    token
                );

                // Create a marker with the custom color for each official station
                const marker = L.marker([latitude, longitude], {
                    icon: createCustomMarker(aqi),
                })
                    .addTo(officialStationsLayer)
                    .bindPopup(
                        `Estación: ${station.station.name}<br> Calidad del aire: ${text} <br> O3: ${stationData.o3} <br> NO2: ${stationData.no2} <br> PM10: ${stationData.pm10} <br> PM2.5: ${stationData.pm25} <br> SO2: ${stationData.so2}`
                    );
            }
        } else {
            console.log("Couldn't obtain the official stations data");
        }
    } catch (error) {
        console.error('Error fetching WAQI data:', error);
    }

    officialStationsLayer.addTo(map);
}

/**
 * Fetches station data from the WAQI API based on the latitude and longitude.
 * @author Mario Luis
 * 
 * @param {number} lat - The latitude of the station.
 * @param {number} lng - The longitude of the station.
 * @param {string} token - The WAQI API token for authentication.
 * @returns {Object} - An object containing the station data.
 * 
 * @description This function fetches the station data (O3, NO2, PM10, PM2.5, SO2) from the WAQI API of a given station.
 * It returns an object with the values of each pollutant. If there's an error, it returns an empty object.
 */
async function fetchStationData(lat, lng, token) {
    try {
        const response = await fetch(
            `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`
        );
        const data = await response.json();

        if (data.status === 'ok') {
            const iaqi = data.data.iaqi;

            // Extract values from the iaqi object
            const o3 = iaqi.o3 ? Math.round(iaqi.o3.v) : null;
            const no2 = iaqi.no2 ? Math.round(iaqi.no2.v) : null;
            const pm10 = iaqi.pm10 ? Math.round(iaqi.pm10.v) : null;
            const pm25 = iaqi.pm25 ? Math.round(iaqi.pm25.v) : null;
            const so2 = iaqi.so2 ? Math.round(iaqi.so2.v) : null;

            // Return values as an object
            return {
                o3: o3,
                no2: no2,
                pm10: pm10,
                pm25: pm25,
                so2: so2,
            };
        } else {
            console.log("Couldn't obtain the station data");
            return {}; // Return an empty object if there's an error
        }
    } catch (error) {
        console.error('Error fetching station data:', error);
        return {}; // Return an empty object if there's an error
    }
}


function getStationName(station) {
    const fullName = station.station.name;
    const shortName = fullName.split(',')[0]; // Separa por la coma y toma el primer elemento
    return shortName;
}

// Export the function for use in HTML
export { fetchOfficialStations };
