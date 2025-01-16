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
function createCustomMarker(aqi, notext) {
    const color = getAQIInfo(aqi).color;
    const text = getAQIInfo(aqi).text;

    const svgIcon = `
        <img src="https://res.cloudinary.com/dcup5oalu/image/upload/v1733928181/assets/antenna-icon.svg" 
            alt="Icon" 
            class="marker-svg-icon" style="color:#ffffff"/>`;

    const iconHtml = `
        <div class="custom-marker" style="--marker-bg-color: ${color}; ${notext ? 'box-shadow: none;' : ''}">
            ${svgIcon}
            ${notext ? '' : `<div style="color:#fff;">${text}</div>`}
        </div>`;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-wrapper',
    });
}

const generatePopUpContent = (station, stationData) => {
    const color = getAQIInfo(station.aqi).color;
    const customMarkerHtml = `
        <div class="custom-marker" style="--marker-bg-color: ${color}; display: flex; justify-content: center; align-items: center; width: 40px; box-shadow: none">
            <img src="https://res.cloudinary.com/dcup5oalu/image/upload/v1733928181/assets/antenna-icon.svg" 
                alt="Icon" 
                class="marker-svg-icon" style="color:#ffffff; margin-right: 0;"/>
        </div>`;
    const popupContent = `
        <div style="min-width: 200px; margin: 0 auto;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                ${customMarkerHtml}
                <h3 style="margin-left: 10px;">${getStationName(station.station.name)}</h3>
            </div>
            <div style="display: flex; flex-direction: row; justify-content: space-between;">
                <div>
                    <p style="margin: 4px 0;"><strong>O3:</strong> ${stationData.o3} AQI</p>
                    <p style="margin: 4px 0;"><strong>NO2:</strong> ${stationData.no2} AQI</p>
                    <p style="margin: 4px 0;"><strong>PM10:</strong> ${stationData.pm10} AQI</p>
                    <p style="margin: 4px 0;"><strong>PM2.5:</strong> ${stationData.pm25} AQI</p>
                    <p style="margin: 4px 0;"><strong>SO2:</strong> ${stationData.so2} AQI</p>
                </div>
                <div style="margin-left: auto;">
                    <h3 style="font-size: 40px; margin-bottom: 0; margin-top: 20px; color:${color};">${station.aqi}<span style="font-size: 20px;">AQI</span></h3>
                    <button style="color: #969696; font-size: 14px; cursor: pointer; background-color: transparent; border: none; text-decoration: underline;">Saber más</button>
                </div>
            </div>
        </div>`;

    return popupContent;
};

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
                        generatePopUpContent(station, stationData)
                        // `Estación: ${station.station.name}<br> Calidad del aire: ${text} <br> O3: ${stationData.o3} <br> NO2: ${stationData.no2} <br> PM10: ${stationData.pm10} <br> PM2.5: ${stationData.pm25} <br> SO2: ${stationData.so2}`
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

function getStationName(name) {
    const shortName = name.split(',')[0]; // Separa por la coma y toma el primer elemento
    return shortName;
}

// Export the function for use in HTML
export { fetchOfficialStations };
