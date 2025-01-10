/**
 * @file generateMapUtils.ts
 * @brief Utilities file for Map generation
 * @author Manuel Borregales
 */
import {
    GasProportionalValueThresholds,
    GeolocatedAirQualityReading,
    MapsGeolocatedAirQualityReadings,
} from '../types/measurements/AirQuality';
import { config } from 'dotenv';

config();

/**
 * Generates a HTML file with a map displaying the air quality data and layers UI.
 *
 * MapsGeolocatedAirQualityReadings -> generateHTMLMap() -> string: HTML content
 *
 * @param data - A set of geolocated air quality readings for building air quality maps.
 * @returns {string} - The HTML content of the map.
 */
export function generateHTMLMap(
    data: MapsGeolocatedAirQualityReadings
): string {
    const token = process.env.WAQI_API_KEY as string;

    const generalHeatmapData = generateHeatmapData(
        data.generalGeolocatedAirQualityReadings
    );
    const coHeatmapData = generateHeatmapData(
        data.coGeolocatedAirQualityReadings
    );
    const o3HeatmapData = generateHeatmapData(
        data.o3GeolocatedAirQualityReadings
    );
    const no2HeatmapData = generateHeatmapData(
        data.no2GeolocatedAirQualityReadings
    );

    const htmlContent = getMapTemplateFilled(
        token,
        generalHeatmapData,
        coHeatmapData,
        no2HeatmapData,
        o3HeatmapData
    );

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
 * generalHeatmapData:string -> getMapTemplateFilled() -> string: HTML content
 * coHeatmapData:string
 * no2HeatmapData:string
 * o3HeatmapData:string
 *
 * @param token - The token for the WAQI API.
 * @param generalHeatmapData - The data for the general air quality heatmap.
 * @param coHeatmapData - The data for the CO air quality heatmap.
 * @param no2HeatmapData - The data for the NO2 air quality heatmap.
 * @param o3HeatmapData - The data for the O3 air quality heatmap.
 * @returns {string} - The HTML content of the map.
 */
function getMapTemplateFilled(
    token: string,
    generalHeatmapData: string,
    coHeatmapData: string,
    no2HeatmapData: string,
    o3HeatmapData: string
): string {
    return `<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">

                <title>Air Quality Map</title>

                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <!-- Add Google Fonts -->
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
                <link
                    rel="stylesheet"
                    href="https://res.cloudinary.com/dcup5oalu/raw/upload/v1736499740/assets/howsair-map.css"
                />

                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <script src="https://unpkg.com/leaflet.heat"></script>
                <script src="https://cdn.jsdelivr.net/gh/spatialsparks/Leaflet.idw/src/leaflet-idw.js"></script>

            </head>

            <body>

                <div id="map"></div>

                 <div id="layers-control-container" class="ha-layers-control-container">
                    <div class="ha-layers-control-title">Capas</div>
                    <div class="layer-option">
                        <label>
                        <input
                            type="checkbox"
                            id="layer-general"
                            class="ha-checkbox"
                            checked
                        />
                        Calidad general
                        </label>
                    </div>
                    <div class="layer-option">
                        <label>
                        <input type="checkbox" id="layer-O3" class="ha-checkbox" />
                        Ozono (O3)
                        </label>
                    </div>
                    <div class="layer-option">
                        <label>
                        <input type="checkbox" id="layer-CO" class="ha-checkbox" />
                        Monóxido de carbono (CO)
                        </label>
                    </div>
                    <div class="layer-option">
                        <label>
                        <input type="checkbox" id="layer-NO2" class="ha-checkbox" />
                        Dióxido de nitrógeno (NO2)
                        </label>
                    </div>
                    <div class="ha-layers-separator"></div>
                    <div class="layer-option">
                        <label>
                        <input
                            type="checkbox"
                            id="layer-officialStations"
                            class="ha-checkbox official-stations-checkbox"
                            checked
                        />
                        Estaciones oficiales
                        </label>
                    </div>
                </div>

                <div class="legend">
                    <div class="legend-title">Calidad del aire</div>
                    <div class="legend-item">
                        <div class="legend-color green"></div>
                        <div>Bueno</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color yellow"></div>
                        <div>Regular</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color red"></div>
                        <div>Peligroso</div>
                    </div>
                </div>

                <script type="module">
                    // Initialize the map and set the initial view and zoom level
                    const map = L.map('map').setView([39.47, -0.376], 14);

                    const generalMeasurements = [${generalHeatmapData}];
                    const coMeasurements = [${coHeatmapData}];
                    const no2Measurements = [${no2HeatmapData}];
                    const o3Measurements = [${o3HeatmapData}];

                    // Add the tile layer for the map's background
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                        subdomains: 'abcd',
                        minZoom: 13,
                        maxZoom: 18
                    }).addTo(map);

                    // General Air Quality Layer
                    let idwLayer = L.idwLayer(
                        generalMeasurements,
                        {
                            opacity: 0.4,
                            cellSize: 4,
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
                            let newCellSize = zoom < 15 ? 4 : zoom < 16 ? 8 : zoom < 17 ? 16 : zoom < 18 ? 28 : 40;
    
                            idwLayer.setOptions({ cellSize: newCellSize }).redraw();
                        }, 200); 

                    }
                    
                    idwLayer.addTo(map);

                    //---------------------------------------------------------------------------------
                    //  OFFICIAL STATIONS LAYER
                    //---------------------------------------------------------------------------------
                   
                    import { fetchOfficialStations } from "https://res.cloudinary.com/dcup5oalu/raw/upload/v1736500682/assets/fetchToOfficialStations.js";

                    const officialStations = L.layerGroup();

                    const token = "${token}"; 

                    fetchOfficialStations(officialStations, token, map);

                    //---------------------------------------------------------------------------------
                    //  LAYERS CONTROL
                    //---------------------------------------------------------------------------------

                    const changeLayer = (measurements) => {
                        map.removeLayer(idwLayer);
                        idwLayer = L.idwLayer(measurements, {
                        opacity: 0.4,
                        cellSize: 4,
                        exp: 2,
                        max: 1,
                        gradient: {
                            0.3: "green",
                            0.6: "yellow",
                            1.0: "red",
                        },
                        });
                        idwLayer.addTo(map);
                    };

                    const identifyMeasurementsFromText = (text) => {
                        switch (text) {
                        case "Calidad general":
                            return generalMeasurements;
                        case "Ozono (O3)":
                            return o3Measurements;
                        case "Monóxido de carbono (CO)":
                            return coMeasurements;
                        case "Dióxido de nitrógeno (NO2)":
                            return no2Measurements;
                        default:
                            return generalMeasurements;
                        }
                    };

                    // ADD EVENT LISTENERS TO ALL CHECKBOXES
                    document.addEventListener("DOMContentLoaded", () => {
                        // Select all checkboxes except the "official stations" checkbox
                        const checkboxes = document.querySelectorAll(
                        ".ha-checkbox:not(.official-stations-checkbox)"
                        );

                        checkboxes.forEach((checkbox) => {
                            checkbox.addEventListener("change", (event) => {
                                // if the checkbox was already checked and it's being unchecked
                                if (event.target.checked) {
                                    checkboxes.forEach((otherCheckbox) => {
                                        if (otherCheckbox !== event.target) {
                                            otherCheckbox.checked = false; // Uncheck the other checkboxes
                                        }
                                    });

                                    // Get the text of the selected checkbox
                                    const label = event.target.closest("label");
                                    const selectedText = label
                                        ? label.textContent.trim()
                                        : "Texto no encontrado";

                                    let newMeasurements = identifyMeasurementsFromText(selectedText);
                                    changeLayer(newMeasurements);
                                } else {
                                    idwLayer.removeFrom(map);
                                }
                            });
                        });
                    });

                    document.addEventListener("DOMContentLoaded", () => {
                        // Select the "official stations" checkbox
                        const officialStationsCheckbox = document.querySelector(
                        ".official-stations-checkbox"
                        );
                        
                        if (officialStationsCheckbox) {
                        officialStationsCheckbox.addEventListener("change", (event) => {
                            if (officialStationsCheckbox.checked) {
                            officialStations.addTo(map);
                            } else {
                            officialStations.removeFrom(map);
                            }
                        });
                        }
                    });

                </script>

            </body>
            </html>`;
}

/* FUNCTIONS FOR TESTING PURPOSES

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
