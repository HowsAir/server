import fs from 'fs';

function generateMap(
    data: { lat: number; lon: number; airQuality: number }[]
): string {
    const thresholds = {
        good: { min: 0, max: 80, color: 'green' },
        regular: { min: 80, max: 90, color: 'yellow' },
        bad: { min: 90, max: 100, color: 'red' },
    };

    const heatmapData = data
        .map(({ lat, lon, airQuality }) => {
            let intensity = 0.1;
            if (
                airQuality >= thresholds.good.min &&
                airQuality <= thresholds.good.max
            ) {
                intensity = 0.3;
            } else if (
                airQuality > thresholds.regular.min &&
                airQuality <= thresholds.regular.max
            ) {
                intensity = 0.6;
            } else if (
                airQuality > thresholds.bad.min &&
                airQuality <= thresholds.bad.max
            ) {
                intensity = 1.0;
            }
            return `[${lat}, ${lon}, ${intensity}]`;
        })
        .join(',');

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
    <script src="../libs/leaflet_plugins/leaflet-idw.js"></script>
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
        const map = L.map('map').setView([39.4699, -0.3763], 16);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            minZoom: 15,
            maxZoom: 19
        }).addTo(map);

        const idwLayer = L.idwLayer(
            [${heatmapData}], // Normalizar intensidad entre 0 y 1
            {
                opacity: 0.5,          // Ajustar opacidad
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

        // Función para ajustar dinámicamente el tamaño de celda según el nivel de zoom
        function updateCellSize() {
            const zoom = map.getZoom();
            let newCellSize;

            if (zoom < 16) {
                newCellSize = 8;
            } else if (zoom >= 16 && zoom < 18) {
                newCellSize = 10; //
            } else if (zoom >= 18) {
                newCellSize = 30;
            }

            console.log('Zoom level', zoom, ' New cell size:', newCellSize);

            // Actualizar el tamaño de celda en la capa IDW
            idwLayer.setOptions({ cellSize: newCellSize });
            idwLayer.redraw();
        }

        // Escuchar el evento de zoom y actualizar el tamaño de celda
        map.on('zoomend', updateCellSize);

        // Llamar a la función inicial para establecer el tamaño de celda correcto
        updateCellSize();

        // Agrega la capa al mapa
        idwLayer.addTo(map);

        // Layers control with "Capas" title and additional layers
        const additionalLayers = {
            "<span class='disabled'>Ozono O3</span>": L.layerGroup(),
            "<span class='disabled'>Monóxido de carbono CO</span>": L.layerGroup(),
            "<span class='disabled'>Dióxido de nitrógeno NO2</span>": L.layerGroup(),
            "<span class='disabled'>Estaciones oficiales</span>": L.layerGroup()
        };

        // Layers control added to the map
        L.control.layers(null, { 
            "Mapa de calidad general": idwLayer,
            ...additionalLayers
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

    fs.writeFileSync('heatmap.html', htmlContent);

    return htmlContent;
}

// Example usage
const randomData = Array.from({ length: 50 }, () => ({
    lat: 39.4699 + (Math.random() - 0.5) * 0.05,
    lon: -0.3763 + (Math.random() - 0.5) * 0.05,
    airQuality: Math.floor(Math.random() * 101),
}));

generateMap(randomData);
