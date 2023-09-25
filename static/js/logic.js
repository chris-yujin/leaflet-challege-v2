// Store API endpoint as url
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Function to determine the marker size based on the earthquake magnitude
const markerSize = (magnitude) => magnitude * 5;

// Function to determine the color based on earthquake depth
const depthColor = (depth) => {
    const colors = ["#fcfcfc", "#7a98f0", "#9df5b1", "#eff549", "#f59c49", "#700303"];
    for (let i = 0; i < colors.length; i++) {
        if (depth < (i + 1) * 20) return colors[i];
    }
    return colors[colors.length - 1];
};

// Function to create the map
const createMap = (earthquakes) => earthquakes.addTo(myMap);

// Function to create GeoJSON layer and bind popups
const createFeatures = (earthquakeData) => {
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                `<h3>${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`
            );
        },
        pointToLayer: (feature, latlng) => {
            const geoJsonMarkerOptions = {
                radius: markerSize(feature.properties.mag),
                fillColor: depthColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geoJsonMarkerOptions);
        }
    });

    createMap(earthquakes);
};

// Creating our initial map object
const myMap = L.map("map", {
    center: [35.52, -102.67],
    zoom: 4
});

// Adding tile layer to map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Adding legend to map
const legend = L.control({ position: "bottomright" });

legend.onAdd = (map) => {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#fcfcfc", "#7a98f0", "#9df5b1", "#eff549", "#f59c49", "#700303"];
    
    // Set white background with some padding and a border
    div.style.backgroundColor = 'white';
    div.style.padding = '8px';
    div.style.border = '1px solid gray';

    // Loop through depth intervals and generate legend labels
    depths.forEach((depth, i) => {
        const label = `${depth}${i < depths.length - 1 ? `&ndash;${depths[i + 1]}` : '+'}`;
        const color = colors[i];
        div.innerHTML += `<i style="background:${color}; width: 18px; height: 18px; float: left; margin-right: 8px;"></i> ${label}<br>`;
    });

    return div;
};

legend.addTo(myMap);

// Perform a GET request to the query URL and call createFeatures
fetch(url)
    .then((response) => response.json())
    .then(createFeatures)
    .catch((error) => console.error("Error fetching data:", error));
