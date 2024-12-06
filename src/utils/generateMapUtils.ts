import fs from 'fs';
import {
    GasProportionalValueThresholds,
    GeolocatedAirQualityReading,
    AirGases,
    AirQualities,
} from '../types/measurements/AirQuality';
import { config } from 'dotenv';

config();

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

function generateHeatmapData(data: GeolocatedAirQualityReading[]): string {
    return data
        .map((reading) => {
            const intensity = getIntensity(reading.proportionalValue as number);
            return `[${reading.latitude}, ${reading.longitude}, ${intensity}]`;
        })
        .join(',');
}

export function generateHTMLMap(data: GeolocatedAirQualityReading[]): string {
    const token = process.env.WAQI_API_KEY as string;
    const heatmapData = generateHeatmapData(data);
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Air Quality Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.heat"></script>
    <script src="src/libs/leaflet_plugins/leaflet-idw.js"></script>
    <style>
        #map {
            height: 100vh;
            width: 100%;
        }
        .leaflet-control-layers .disabled {
            pointer-events: none;
            opacity: 0.5;
        }
        .legend {
            position: absolute;
            bottom: 30px;
            left: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            line-height: 1.5em;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }
        .legend-title {
            font-weight: bold;
        }
        .legend-item {
            display: flex;
            align-items: center;
        }
        .legend-item .color-box {
            width: 15px;
            height: 15px;
            margin-right: 5px;
            border-radius: 50%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const map = L.map('map').setView([39.4699, -0.3763], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            minZoom: 14,
            maxZoom: 19
        }).addTo(map);

        const idwLayer = L.idwLayer(
            [${heatmapData}], // Normalizar intensidad entre 0 y 1
            {
                opacity: 0.4,          // Ajustar opacidad
                cellSize: 6,          // Tamaño de celda (ajusta según detalle)
                exp: 2,                // Exponente para ponderación (2 es estándar para IDW)
                max: 1,                // Máximo valor (intensidad normalizada)
                gradient: {            // Gradiente de colores
                    0.3: 'green',
                    0.6: 'yellow',
                    1.0: 'red'
                }
            }
        );

        map.on('zoomend', updateCellSize);

        function updateCellSize() {
            const zoom = map.getZoom();
            let newCellSize;

            if (zoom < 16) {
                newCellSize = 6;
            } else if (zoom >= 16 && zoom < 18) {
                newCellSize = 10; 
            } else if (zoom >= 18) {
                newCellSize = 25; // Ajuste de tamaño de celda a medida que el zoom es más alto
            }

            // Actualiza las opciones del layer de IDW con el nuevo tamaño de celda
            idwLayer.setOptions({ cellSize: newCellSize });
            idwLayer.redraw();
        }

        idwLayer.addTo(map);

        // Capa de estaciones oficiales (nuevo)
        const estacionesOficiales = L.layerGroup();

        const token = "${token}"; // Aquí se inserta el token
        console.log('Token in client:', token);

        fetch(\`https://api.waqi.info/map/bounds/?latlng=39.4,-0.6,39.6,-0.2&token=\${token}\`)
        .then(response => response.json())
            .then(data => {
                if (data.status === "ok") {
                    // Iteramos sobre cada estación
                    data.data.forEach(station => {
                        const aqi = station.aqi; // AQI de la estación
                        const latitude = station.lat; // Latitud
                        const longitude = station.lon; // Longitud
                        
                        // Crear el marcador para cada estación
                        const marker = L.marker([latitude, longitude])
                            .addTo(estacionesOficiales)
                            .bindPopup(\`Estación: \${station.station.name}<br> AQI: \${aqi}\`)
                            .openPopup();
                    });
                } else {
                    console.log("No se pudieron obtener los datos de las estaciones");
                }
            })
            .catch(error => console.error('Error fetching WAQI data:', error));

        // Layers control with "Capas" title and additional layers
        const additionalLayers = {
            "<span class='disabled'>Ozono O3</span>": L.layerGroup(),
            "<span class='disabled'>Monóxido de carbono CO</span>": L.layerGroup(),
            "<span class='disabled'>Dióxido de nitrógeno NO2</span>": L.layerGroup(),
        };

        estacionesOficiales.addTo(map);

        // Layers control added to the map
        L.control.layers(null, { 
            "Mapa de calidad general": idwLayer,
            ...additionalLayers, 
            "Estaciones oficiales": estacionesOficiales
        }, { collapsed: false }).addTo(map);

        // Add legend
        const legend = L.control({ position: 'bottomleft' });
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = \`
                <div class="legend-title">Leyenda</div>
                <div class="legend-item"><div class="color-box" style="background: green;"></div>Bueno</div>
                <div class="legend-item"><div class="color-box" style="background: yellow;"></div>Regular</div>
                <div class="legend-item"><div class="color-box" style="background: red;"></div>Malo</div>
            \`;
            return div;
        };
        legend.addTo(map);

    </script>
</body>
</html>`;

    return htmlContent;
}

// // Generar datos de ejemplo utilizando la interfaz GeolocatedAirQualityReading
// const randomData: GeolocatedAirQualityReading[] = Array.from(
//     { length: 50 },
//     () => ({
//         latitude: 39.4699 + (Math.random() - 0.5) * 0.05,
//         longitude: -0.3763 + (Math.random() - 0.5) * 0.05,
//         airQuality:
//             Object.values(AirQualities)[
//                 Math.floor(Math.random() * Object.values(AirQualities).length)
//             ],
//         // Asignar un valor aleatorio dentro de AirQualities
//         proportionalValue: Math.random() * 100, // Valor proporcional aleatorio
//         gas: Object.values(AirGases)[
//             Math.floor(Math.random() * Object.values(AirGases).length)
//         ] as AirGases, // Asignar gas aleatorio
//         ppmValue: Math.random() * 1000, // Valor de ppm aleatorio
//         timestamp: new Date(), // Timestamp actual
//     })
// );

// function generateHTMLFile(content: string): void {
//     fs.writeFileSync('heatmap.html', content);
// }

// generateHTMLFile(generateHTMLMap(randomData));
