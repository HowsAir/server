/**
 * @file generateMapUtils.test.ts
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

                    body { margin: 0;}

                    #map {
                        height: 100vh;
                        width: 100%;
                    }
                        
                    .leaflet-touch .leaflet-control-layers {
                        border: 0px;
                    }

                    /*-------------------------------------*/
                    /* Custom marker style */
                    /*-------------------------------------*/

                    .custom-marker {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        width: 110px;
                        height: 30px;
                        background-color: var(--marker-bg-color);
                        color: white;
                        border-radius: 20px;
                        padding: 3px;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                        font-family: 'Outfit', sans-serif;
                        font-size: 14px;
                        text-align: center;
                        transition: background-color 0.3s, transform 0.3s; /* Smooth transition for hover effect */
                    }

                    .custom-marker:hover {
                        transform: scale(1.1); /* Slightly scale up the marker */
                    }

                    /* Ensure :active doesn't override hover */
                    .custom-marker:active {
                        transform: scale(1); /* No scaling when clicked */
                    }

                    .marker-svg-icon {
                        width: 20px; /* Adjust the icon size */
                        height: 20px;
                        margin-right: 5px;
                        filter: invert(1) sepia(1) saturate(5) hue-rotate(180deg); /* Example for white color */
                    }

                    .marker-text {
                        font-size: 10px;
                        font-weight: bold;
                        color: white;
                    }

                    /*-------------------------------------*/
                    /* Layers controller style */
                    /*-------------------------------------*/

                    .layer-label {
                        font-family: 'Outfit', sans-serif;
                    }

                    .layers-control-title {
                        font-size: 16px;
                        font-weight: bold;
                        background-color: #fff;
                        border-radius: 5px;
                        margin-bottom: 10px;
                    }

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
                    
                    /* General checkbox styles */
                    .leaflet-control-layers-selector {
                        appearance: none;
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        width: 16px;
                        height: 16px;
                        border: 2px solid #ccc;
                        border-radius: 50%; /* Default circular checkboxes */
                        cursor: pointer;
                        outline: none;
                        background-color: white;
                        display: inline-block;
                        vertical-align: middle;
                        margin-right: 8px;
                        transition: background-color 0.3s, border-color 0.3s;
                    }

                    /* Specific styles for the "official stations" checkbox */
                    .leaflet-control-layers input[type="checkbox"].official-stations-checkbox {
                        border-radius: 5px; /* Less border radius for "Estaciones oficiales" checkbox */
                    }

                    /* Checked state for the checkbox */
                    .leaflet-control-layers-selector:checked {
                        background-color: #1074E7; /* Blue background */
                        border-color: #1074E7;
                        position: relative;
                    }

                    /* Create a white checkmark */
                    .leaflet-control-layers-selector:checked::after {
                        content: '';
                        display: block;
                        width: 4px;
                        height: 7px;
                        border: solid white;
                        border-width: 0 2px 2px 0;
                        transform: rotate(45deg);
                        position: absolute;
                        top: 1px;
                        left: 3px;
                    }

                    /* Style for the separator between layers */
                    .layers-separator {
                        height: 1px; /* Height of the separator */
                        background-color: #f0f0f0; /* Light gray color */
                        width: 200px; /* Width of the separator */
                        margin: 5px auto; /* Vertical margin of 5px */
                        border-radius: 5px; /* Border radius for smooth corners */
                    }
                    
                    /*-------------------------------------*/
                    /* Legend style */
                    /*-------------------------------------*/

                    .legend {
                        position: absolute;
                        bottom: 10px;
                        left: 10px;
                        width: 105px;
                        height: 105px;
                        background-color: rgba(255, 255, 255);
                        border-radius: 10px;
                        padding: 15px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                        font-size: 14px;
                        color: #333;
                        z-index: 1000;
                    }

                    .legend-title {
                        font-weight: bold;
                        margin-bottom: 10px;
                    }

                    .legend-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;
                    }

                    .legend-color {
                        width: 20px;
                        height: 20px;
                        border-radius: 5px;
                        margin-right: 10px;
                    }

                    .legend-color.green { background-color: #35B765; }
                    .legend-color.yellow { background-color: #E5B41C; }
                    .legend-color.red { background-color: #E24C4C; }

                </style>

            </head>

            <body>

                <div id="map"></div>

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

                <script>

                    // Initialize the map and set the initial view and zoom level
                    const map = L.map('map').setView([39.47, -0.376], 14);

                    // Add the tile layer for the map's background
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                        subdomains: 'abcd',
                        minZoom: 13,
                        maxZoom: 18
                    }).addTo(map);

                    // General Air Quality Layer
                        const idwLayerGeneral = L.idwLayer(
                            [${generalHeatmapData}],
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

                        // CO Layer
                        const idwLayerCO = L.idwLayer(
                            [${coHeatmapData}],
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

                        // NO2 Layer
                        const idwLayerNO2 = L.idwLayer(
                            [${no2HeatmapData}],
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

                        // O3 Layer
                        const idwLayerO3 = L.idwLayer(
                            [${o3HeatmapData}],
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
    
                            idwLayerGeneral.setOptions({ cellSize: newCellSize }).redraw();
                            idwLayerCO.setOptions({ cellSize: newCellSize }).redraw();
                            idwLayerNO2.setOptions({ cellSize: newCellSize }).redraw();
                            idwLayerO3.setOptions({ cellSize: newCellSize }).redraw();
                        }, 200); 

                    }
                    
                    idwLayerGeneral.addTo(map);
                    //idwLayerCO.addTo(map);
                    //idwLayerNO2.addTo(map);
                    //idwLayerO3.addTo(map);

                    //---------------------------------------------------------------------------------
                    //  FETCH TO API WAQI
                    //---------------------------------------------------------------------------------

                    const officialStations = L.layerGroup();

                    const token = "${token}"; 

                    function getAQIInfo(aqi) {
                        if (aqi <= 50) { // green
                            return { color: "#35B765", text: "Limpio" };
                        }
                        if (aqi <= 100) { // yellow
                            return { color: "#E5B41C", text: "Moderado" };
                        }
                        if (aqi <= 200) { // red 
                            return { color: "#E24C4C", text: "Insalubre" };
                        } // purple
                        return { color: "#EF5CDD", text: "Peligroso" };
                    }

                    // Function to create custom HTML markers
                    function createCustomMarker(aqi) {
                        const color = getAQIInfo(aqi).color;
                        const text = getAQIInfo(aqi).text;

                        const svgIcon = \`
                            <img src="https://res.cloudinary.com/dcup5oalu/image/upload/v1733928181/assets/antenna-icon.svg" 
                                alt="Icon" 
                                class="marker-svg-icon" style="color:#ffffff"/>\`;

                        const iconHtml = \`
                            <div class="custom-marker" style="--marker-bg-color: \${color}\;
                                                              --marker-text-color: "white">
                                <div style="margin-top:auto">\${svgIcon}\</div>
                                <div style="color:#ffffff">\${text}\</div>
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

                    const layersControl = L.control.layers(null, { 
                        "<span class='layer-label'>Mapa de calidad general</span>": idwLayerGeneral,
                        "<span class='layer-label'>Monóxido de carbono CO</span>": idwLayerCO,
                        "<span class='layer-label'>Dióxido de nitrógeno NO2</span>": idwLayerNO2,
                        "<span class='layer-label'>Ozono O3</span>": idwLayerO3,
                        "<span class='layer-label official-stations'>Estaciones oficiales</span>": officialStations
                    }, { collapsed: false }).addTo(map);

                    // Access the layers control container to style it
                    const layersControlContainer = layersControl.getContainer();

                    // Variable para mantener la capa activa
                    let activeLayer = \`<span class="layer-label">Mapa de calidad general</span>\`;

                    // Wait for the layers control to render completely
                    setTimeout(() => {
                        // ADDING TITLE TO LAYERS CONTROL

                        const title = document.createElement('div');
                        title.innerHTML = '<strong>Capas</strong>';
                        title.className = 'layers-control-title';

                        // Insert the title into the layers control box
                        layersControlContainer.insertBefore(title, layersControlContainer.firstChild);

                        // ADDING SEPARATOR TO LAYERS CONTROL AND CHANGING STYLE OF OFFICIAL STATIONS CHECKBOX

                        const layerSeparator = document.createElement('div');
                        layerSeparator.className = 'layers-separator';

                        // Find the "leaflet-control-layers-overlays" container
                        const overlaysContainer = layersControlContainer.querySelector('.leaflet-control-layers-overlays');

                        if (overlaysContainer) {
                            // Find the "Estaciones oficiales" label and its parent label
                            const officialStationsLabelParent = overlaysContainer.querySelector('span.official-stations')?.closest('label');

                            if (officialStationsLabelParent) {
                                // Insert the separator before the "Estaciones oficiales" label
                                overlaysContainer.insertBefore(layerSeparator, officialStationsLabelParent);
                            }

                            // Changing the style of the official stations checkbox
                            const checkbox = officialStationsLabelParent?.querySelector('input[type="checkbox"]');
                            checkbox?.classList.add('official-stations-checkbox');
                        }

                        // ADD EVENT LISTENERS TO ALL CHECKBOXES

                        const checkboxes = overlaysContainer.querySelectorAll('input[type="checkbox"]');
                        checkboxes.forEach(checkbox => {
                            checkbox.addEventListener('change', (event) => {
                                const layerName = checkbox.nextElementSibling?.innerHTML.trim();

                                console.log('previous layer:', activeLayer);
                                console.log('new name:', layerName);

                                // Ignorar cualquier cambio relacionado con la capa de "Estaciones oficiales"
                                if (layerName === \`<span class="layer-label official-stations">Estaciones oficiales</span>\`) {
                                    console.log('No se puede modificar la capa de estaciones oficiales');
                                    return;
                                }

                                // Si el checkbox está activado
                                if (checkbox.checked) {
                                    // Eliminar la capa activa previa si es necesario
                                    if (activeLayer && activeLayer !== layerName) {
                                        const previousCheckbox = Array.from(checkboxes).find(cb => cb.nextElementSibling?.innerHTML.trim() === activeLayer);
                                        if (previousCheckbox) {
                                            previousCheckbox.checked = false;
                                            const previousLayer = layersControl._layers.find(layer => layer.name === activeLayer)?.layer;
                                            if (previousLayer) previousLayer.remove();
                                        }

                                        if(activeLayer === \`<span class="layer-label">Mapa de calidad general</span>\`) map.removeLayer(idwLayerGeneral);
                                            else if(activeLayer === \`<span class="layer-label">MonóWxido de carbono CO</span>\`) map.removeLayer(idwLayerCO);
                                            else if(activeLayer === \`<span class="layer-label">Dióxido de nitrógeno NO2</span>\`) map.removeLayer(idwLayerNO2);
                                            else if(activeLayer === \`<span class="layer-label">Ozono O3</span>\`) map.removeLayer(idwLayerO3);
                                    }

                                    // Establecer la nueva capa activa
                                    activeLayer = layerName;

                                    // Añadir la nueva capa al mapa
                                    const newLayer = layersControl._layers.find(layer => layer.name === layerName)?.layer;
                                    if (newLayer) map.addLayer(newLayer);
                                } else {
                                    // Si el checkbox se desactiva, eliminar la capa correspondiente
                                    const layer = layersControl._layers.find(layer => layer.name === layerName)?.layer;
                                    if (layer) map.removeLayer(layer);

                                    // No modificar activeLayer si es "Estaciones oficiales"
                                    if (layerName !== '<span class="layer-label">Estaciones oficiales</span>') {
                                        activeLayer = null;
                                    }
                                }
                            });
                        });
                    }, 100); // Delay to ensure the DOM is fully rendered
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
