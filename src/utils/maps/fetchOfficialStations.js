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

    // Generate a unique ID for this popup
    const popupId = `aqiInfoPopup-${station.station.name.replace(/\s+/g, '-')}`;

    // AQI Info Popup HTML
    const aqiInfoPopup = `
        <div id="${popupId}" class="aqi-info-popup" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 1000;">
            <div id="aqiInfoContainer" style="width: 600px; font-family: 'Outfit'; border-radius: 15px; background-color: #f7f7f7; padding: 0 20px; padding-bottom: 12px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <h3 style="padding-top: 12px; text-align: center; font-weight: 500">
                    ¿Qué es el indice de calidad del aire (AQI)?
                </h3>
                <div id="aqiInfoInnerContainer" style="display: flex; justify-content: space-between; padding: 20px; border-radius: 20px; background-color: white;">
                    <div class="responsiveAqiData" style="width: 45%">
                        <p style="font-weight: 300; font-size: 14px">
                            El AQI traduce los niveles de contaminación en valores y colores que
                            indican su impacto en la salud.
                        </p>
                        <p style="font-size: 16px; margin-bottom: 0">¿Cómo se calcula?</p>
                        <p style="font-weight: 300; font-size: 14px; margin-top: 8px">
                            El AQI se calcula a partir de contaminantes clave como PM2.5, PM10,
                            ozono (O₃), NO₂, SO₂ y CO, evaluando cómo afectan la salud humana y
                            la calidad del aire.
                        </p>
                    </div>
                    <table class="responsiveAqiData" style="width: 45%; border-collapse: collapse">
                        <thead>
                            <tr style="color: #667085; border-bottom: 1px solid #EAECF0">
                                <th style="font-weight: normal; font-size: 12px; text-align: left; padding-bottom: 8px;">Categoria</th>
                                <th style="font-weight: normal; font-size: 12px; text-align: left; padding-bottom: 8px;">Rango AQI</th>
                                <th style="font-weight: normal; font-size: 12px; text-align: left; padding-bottom: 8px;">Color</th>
                            </tr>
                        </thead>
                        <tbody style="font-size: 14px">
                            <tr style="border-bottom: 1px solid #EAECF0">
                                <td>Limpio</td>
                                <td>0-50</td>
                                <td><div style="width: 20px; height: 20px; border-radius: 20%; background-color: #49b504;"></div></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #EAECF0">
                                <td>Moderado</td>
                                <td>51-150</td>
                                <td><div style="width: 20px; height: 20px; border-radius: 20%; background-color: #eab30e;"></div></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #EAECF0">
                                <td>Insalubre</td>
                                <td>150-300</td>
                                <td><div style="width: 20px; height: 20px; border-radius: 20%; background-color: #e10000;"></div></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #EAECF0">
                                <td>Peligroso</td>
                                <td>300+</td>
                                <td><div style="width: 20px; height: 20px; border-radius: 20%; background-color: #ef5cdd;"></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button class="close-popup-btn" style="position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 20px;">×</button>
            </div>
        </div>`;

    const popupContent = `
        ${aqiInfoPopup}
        <div style="font-family: 'Outfit', sans-serif; min-width: 200px; margin: 0 auto;">
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
                    <button class="saber-mas-btn" data-popup-id="${popupId}" style="color: #969696; font-size: 14px; cursor: pointer; background-color: transparent; border: none; text-decoration: underline;">Saber más</button>
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
                const stationData = await fetchStationData(
                    latitude,
                    longitude,
                    token
                );

                const marker = L.marker([latitude, longitude], {
                    icon: createCustomMarker(aqi),
                })
                    .addTo(officialStationsLayer)
                    .bindPopup(generatePopUpContent(station, stationData));

                // Add event listener after popup opens
                marker.on('popupopen', function () {
                    // Handle "Saber más" button click
                    const saberMasBtn =
                        document.querySelector('.saber-mas-btn');
                    if (saberMasBtn) {
                        saberMasBtn.addEventListener('click', function () {
                            const popupId = this.getAttribute('data-popup-id');
                            const popup = document.getElementById(popupId);
                            if (popup) {
                                popup.style.display = 'block';
                            }
                        });
                    }

                    // Handle close button click
                    const closeBtn = document.querySelector('.close-popup-btn');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', function () {
                            const popup = this.closest('.aqi-info-popup');
                            if (popup) {
                                popup.style.display = 'none';
                            }
                        });
                    }

                    // Handle click outside popup
                    const aqiPopup = document.querySelector('.aqi-info-popup');
                    if (aqiPopup) {
                        aqiPopup.addEventListener('click', function (event) {
                            if (event.target === this) {
                                this.style.display = 'none';
                            }
                        });
                    }
                });
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
