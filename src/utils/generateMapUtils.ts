/**
 * @file generateMapUtils.test.ts
 * @brief Utilities file for Map generation
 * @author Manuel Borregales
 */
import {
    GasProportionalValueThresholds,
    GeolocatedAirQualityReading,
} from '../types/measurements/AirQuality';
import { config } from 'dotenv';
import fs from 'fs';
import { AirQualities, AirGases } from '../types/measurements/AirQuality';

config();

/**
 * Generates a HTML file with a map displaying the air quality data and layers UI.
 *
 * GeoLocationAirQualityReading[] -> generateHTMLMap() -> string: HTML content
 *
 * @param data - An array of GeolocatedAirQualityReading objects containing the air quality data.
 * @returns {string} - The HTML content of the map.
 */
export function generateHTMLMap(data: GeolocatedAirQualityReading[]): string {
    const token = process.env.WAQI_API_KEY as string;
    const heatmapData = generateHeatmapData(data);
    const htmlContent = getMapTemplateFilled(token, heatmapData);

    return htmlContent;
}

/**
 *  Maps the data for the heatmap layer in the map.
 *
 * GeoLocationAirQualityReading[] -> generateHeatmapData() -> string: Heatmap data
 *
 * @param data - An array of GeolocatedAirQualityReading objects containing the air quality data.
 * @returns {string} - The data for the heatmap layer.
 */
function generateHeatmapData(data: GeolocatedAirQualityReading[]): string {
    return data
        .map((reading) => {
            const intensity = getIntensity(reading.proportionalValue as number);
            return `[${reading.latitude}, ${reading.longitude}, ${intensity}]`;
        })
        .join(',');
}

/**
 * Returns the intensity of the air quality reading.
 *
 * number -> getIntensity() -> number: Intensity
 *
 * @param airQuality - The air quality value.
 * @returns {number} - The intensity of the air quality reading.
 */
function getIntensity(airQuality: number): number {
    if (airQuality <= GasProportionalValueThresholds.Good) {
        return 0.3;
    } else if (airQuality <= GasProportionalValueThresholds.Regular) {
        return 0.6;
    } else if (airQuality <= GasProportionalValueThresholds.Bad) {
        return 1.0;
    }
    return 0.1;
}

/**
 * Returns a string with the HTML content of the map.
 *
 * token:string
 * heatmapDaTa:string -> getMapTemplateFilled() -> string: HTML content
 *
 * @param data - An array of GeolocatedAirQualityReading objects containing the air quality data.
 * @returns {string} - The HTML content of the map.
 */
function getMapTemplateFilled(token: string, heatmapData: string): string {
    return `<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <title>Air Quality Map</title>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <script src="https://unpkg.com/leaflet.heat"></script>
                <script src="https://cdn.jsdelivr.net/gh/spatialsparks/Leaflet.idw/src/leaflet-idw.js"></script>
                <!-- Add Google Fonts -->
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">

                <style>

                    /* Apply the font to all elements */
                    body, html, .leaflet-control-layers, .layers-control-title {
                        font-family: 'Outfit', sans-serif;
                    }

                    #map {
                        height: 100vh;
                        width: 100%;
                    }

                    .custom-marker {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        width: 100px; /* Adjust size as needed */
                        height: 30px;
                        background-color: var(--marker-bg-color);
                        color: var(--marker-text-color);
                        border-radius: 20px;
                        padding: 3px;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                        font-family: 'Outfit', sans-serif;
                        font-size: 14px;
                        text-align: center;
                    }

                    .marker-svg-icon {
                        width: 20px; /* Adjust the icon size */
                        height: 20px;
                        margin-right: 5px;
                    }

                    .marker-text {
                        font-size: 10px;
                        font-weight: bold;
                    }

                    .layer-label {
                        font-family: 'Outfit', sans-serif;
                    }

                    /* Custom title for the layers control */
                    .layers-control-title {
                        font-size: 16px;
                        font-weight: bold;
                        background-color: #fff;
                        border-radius: 5px;
                        margin-bottom: 10px;
                    }

                    /* Style the layers control box */
                    .leaflet-control-layers {
                        background-color: #fff;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.2);
                        padding: 20px;
                        font-size: 14px;
                        font-family: Arial, sans-serif;
                    }

                    .leaflet-control-layers .disabled {
                        pointer-events: none;
                        opacity: 0.5;
                    }

                </style>

            </head>

            <body>

                <div id="map"></div>

                <script>

                    // Initialize the map and set the initial view and zoom level
                    const map = L.map('map').setView([39.47, -0.376], 14);

                    // Add the tile layer for the map's background
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                        subdomains: 'abcd',
                        minZoom: 14,
                        maxZoom: 18
                    }).addTo(map);

                    //---------------------------------------------------------------------------------
                    //  GENERAL QUALITY MAP WITH IDW LAYER
                    //---------------------------------------------------------------------------------

                    // Create the IDW layer from the plugin with the heatmap data
                    const idwLayer = L.idwLayer(
                        [${heatmapData}], 
                        {
                            opacity: 0.4,          
                            cellSize: 8,          // Initially 15, it changes depending of the zoom, for better performance
                            exp: 2,                
                            max: 1,                
                            gradient: {            
                                0.3: 'green',
                                0.6: 'yellow',
                                1.0: 'red'
                            }
                        }
                    );

                    // Everytime the zoom changes, update the cell size using Debounce
                    map.on('zoomend', updateCellSize);

                    let redrawTimeout;

                    function updateCellSize() {
                        clearTimeout(redrawTimeout);

                        // After 200ms has passed since the zoom changed, redraws the IDW layer
                        redrawTimeout = setTimeout(() => {
                            const zoom = map.getZoom();
                            let newCellSize = zoom < 15 ? 8 : zoom < 16 ? 15 : zoom < 17 ? 30 : zoom < 18 ? 35 : 75;
    
                            idwLayer.setOptions({ cellSize: newCellSize });
                            idwLayer.redraw();
                        }, 200); 

                    }
                    
                    idwLayer.addTo(map);

                    //---------------------------------------------------------------------------------
                    //  FETCH TO API WAQI
                    //---------------------------------------------------------------------------------

                    const officialStations = L.layerGroup();

                    const token = "${token}"; 

                    function getAQIInfo(aqi) {
                        if (aqi <= 50) { // green
                            return { color: "#35B765", text: "Buena" };
                        }
                        if (aqi <= 100) { // yellow
                            return { color: "#EFBF2D", text: "Regular" };
                        }
                        if (aqi <= 200) { // red 
                            return { color: "#E24C4C", text: "Insalubre" };
                        } // purple
                        return { color: "#DE7CD2", text: "Peligroso" };
                    }

                    // Function to create custom HTML markers
                    function createCustomMarker(aqi) {
                        const color = getAQIInfo(aqi).color;
                        const text = getAQIInfo(aqi).text;

                        const svgIcon = \`
                            <img src="https://res.cloudinary.com/dcup5oalu/image/upload/v1733928181/assets/antenna-icon.svg" 
                                alt="Icon" 
                                class="marker-svg-icon" />\`;

                        const iconHtml = \`
                            <div class="custom-marker" style="--marker-bg-color: \${color}\;
                                                              --marker-text-color: "black">
                                <div style="margin-top:auto">\${svgIcon}\</div>
                                <div>\${text}\</div>
                            </div>\`;

                        return L.divIcon({
                            html: iconHtml,
                            className: 'custom-marker-wrapper',
                        });
                    }

                    // Fetch the data from the WAQI API using HowsAir token
                    fetch(\`https://api.waqi.info/map/bounds/?latlng=39.4,-0.6,39.6,-0.2&token=\${token}\`)
                    .then(response => response.json())
                        .then(data => {
                            if (data.status === "ok") {
                                data.data.forEach(station => {
                                const aqi = station.aqi; 
                                const latitude = station.lat; 
                                const longitude = station.lon; 
                                const aqiInfo = getAQIInfo(aqi); // Retrieve AQI info here
                                const text = aqiInfo.text; // Get the text again

                                // Create a marker with the custom color for each official station
                                const marker = L.marker([latitude, longitude], {
                                    icon: createCustomMarker(aqi),
                                }).addTo(officialStations)
                                .bindPopup(\`Estación: \${station.station.name}<br> AQI: \${aqi}<br> Calidad del aire: \${text}\`);
                            });
                            } else {
                                console.log("Couldn't obtain the official stations data");
                            }
                        })
                        .catch(error => console.error('Error fetching WAQI data:', error));

                    officialStations.addTo(map);

                    //---------------------------------------------------------------------------------
                    //  LAYERS CONTROL
                    //---------------------------------------------------------------------------------

                    // Disabled layers for each gas type that will be added later
                    const additionalLayers = {
                        "<span class='disabled'>Ozono O3</span>": L.layerGroup(),
                        "<span class='disabled'>Monóxido de carbono CO</span>": L.layerGroup(),
                        "<span class='disabled'>Dióxido de nitrógeno NO2</span>": L.layerGroup(),
                    };

                    // Layer controler with the IDW layer, official stations and the additional layers
                    const layersControl = L.control.layers(null, { 
                        "Mapa de calidad general": idwLayer,
                        ...additionalLayers, 
                        "Estaciones oficiales": officialStations
                    }, { collapsed: false }).addTo(map);

                    // Access the layers control container to style it
                    const layersControlContainer = layersControl.getContainer();

                    const title = document.createElement('div');
                    title.innerHTML = '<strong>Capas</strong>';
                    title.className = 'layers-control-title'; // Reference to the Class on the css side

                    // Insert the title into the layers control box
                    layersControlContainer.insertBefore(title, layersControlContainer.firstChild);

                </script>

            </body>
            </html>`;
}

// FUNCTIONS FOR TESTING PURPOSES

// Generar datos de ejemplo utilizando la interfaz GeolocatedAirQualityReading
const randomData: GeolocatedAirQualityReading[] = Array.from(
    { length: 50 },
    () => ({
        latitude: 39.4699 + (Math.random() - 0.5) * 0.05,
        longitude: -0.3763 + (Math.random() - 0.5) * 0.05,
        airQuality:
            Object.values(AirQualities)[
                Math.floor(Math.random() * Object.values(AirQualities).length)
            ],
        // Asignar un valor aleatorio dentro de AirQualities
        proportionalValue: Math.random() * 100, // Valor proporcional aleatorio
        gas: Object.values(AirGases)[
            Math.floor(Math.random() * Object.values(AirGases).length)
        ] as AirGases, // Asignar gas aleatorio
        ppmValue: Math.random() * 1000, // Valor de ppm aleatorio
        timestamp: new Date(), // Timestamp actual
    })
);

function generateHTMLFile(content: string): void {
    fs.writeFileSync('heatmap.html', content);
}

generateHTMLFile(generateHTMLMap(randomData));
// */
