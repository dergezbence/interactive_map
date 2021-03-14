import { kml } from "@tmcw/togeojson";
import './map_style.css';

class InteractiveMap {
 
    constructor() {
        this.layerMeta = [
            {
            label: 'Recommended paddle', 
            url: 'https://njpaddle.org/kmls/merill-creek-alt-paddle.kmz',
            description: 'RECOMMENDED loremipsum'
            },

            {
            label: 'Full lake paddle', 
            url: 'https://njpaddle.org/kmls/merill-creek-full-paddle.kmz',
            description: 'FULLLAKE loremipsum'
            },
        ]

        this.layerControls = document.getElementById('layers_onoff_selector');
        this.layerDescription = document.getElementById('layer_description');
        this.legendControls = document.getElementById('legends_onoff_selector');
        this.legendContainer = document.getElementById('mapLegend');

        window.initMap = this.initMap;
    }

    initMap = () => {
        this.markers = [];
        this.map = this.createMap();
        this.loadLayers();
        this.renderLayerSelectors();
        this.loadLegend();
        this.showLegend();
    }

    createMap = () => {
        return new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: { lat: 40.73663275920072, lng: -75.10072000562093 },
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            draggable: true
        });
    }

    loadLayers = () => {
        this.layerDatas = [];
        this.layerMeta.forEach(layerData => {
            const layer = new google.maps.KmlLayer(
                layerData.url,
                { preserveViewport:true, 
                  suppressInfoWindows: true,
                }
            );
            this.layerDatas.push({label: layerData.label, layer: layer, description: layerData.description});
        })
    }

    renderLayerSelectors = () => {
        this.layerDatas.forEach( (layerData, index) => {
            const radioButton = document.createElement('input');
            radioButton.setAttribute('type', 'radio');
            radioButton.setAttribute('name', 'layer');
            radioButton.setAttribute('value', layerData.label);
            radioButton.setAttribute('id', 'radio' + index);
            const label = document.createElement('label');
            label.setAttribute('for', 'radio' + index)
            label.innerText = layerData.label;
            const selectorDiv = document.createElement('div');
            selectorDiv.appendChild(radioButton);
            selectorDiv.appendChild(label);
            this.layerControls.appendChild(selectorDiv);
            radioButton.addEventListener('change', e => {
                this.layerDatas.forEach(data => {
                    if(data.label === e.target.defaultValue){
                        data.layer.setMap(this.map);
                        this.layerDescription.innerText = data.description;
                    }
                    else{
                        data.layer.setMap(null);
                    }
                });
            });
        });
    }

    loadLegend = () => {
        /*
          Because of a limitation of google maps api,
          to be able to reference the different markers in the legend layer, 
          its loaded and parsed from a local KML file
        */
        fetch("./kmz/legend.kml")
        .then(function(response) {
            return response.text();
        })
        .then((xml) => {
            this.features = kml(new DOMParser().parseFromString(xml, "text/xml")).features;
            this.renderLegends();
        });
    }

    showLegend = () => {
        var legend = document.getElementById('mapLegend');
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
    }

    renderLegends = () => {
        this.features.forEach(feature => {     
            let image = document.createElement('img');
            image.setAttribute('src', feature.properties.icon)
            let label = document.createElement('span');
            label.innerText = feature.properties.name;
            let legendEntry = document.createElement('div');
            legendEntry.appendChild(image);
            legendEntry.appendChild(label);
            this.legendContainer.appendChild(legendEntry);
            this.createMarker(feature, image);
        });

        this.renderLegendSelector('Legends');

        // close marker info window on outer click
        google.maps.event.addListener(this.map, 'click', () =>{
                this.currentlyOpenInfoWindow && 
                this.currentlyOpenInfoWindow.close();
        });
    }

    createMarker = (feature, legend) => {
        const marker = new google.maps.Marker({
            position: { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] },
            map: this.map,
            icon: {
                url: feature.properties.icon,
                scaledSize: new google.maps.Size(30, 30),
            }
        });
        this.markers.push(marker);

        !feature.properties.description && (feature.properties.description = '');
        
        const contentString =
           '<div id="content">' +
               '<h3 id="firstHeading" class="firstHeading">' + 
                    feature.properties.name +
                '</h3>' +
                '<div id="bodyContent">' +
                    feature.properties.description +
                '</div>' +
            '</div>';

        // show markers info window on click
        marker.addListener("click", () => {
            const infowindow = new google.maps.InfoWindow({content: contentString});
            this.currentlyOpenInfoWindow = infowindow;
            infowindow.open(this.map, marker);
            //window.setTimeout(() => this.map.setCenter({ lat: 40.73663275920072, lng: -75.10072000562093 }), 200); 
        });

        // bounce marker on legend click
        legend && 
        legend.addEventListener("click", () => {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout(() => marker.setAnimation(null), 3000);
        });
    }

    renderLegendSelector = (name) => {
       const checkBox = document.createElement('input');
       checkBox.setAttribute('type', 'checkbox');
       checkBox.checked = true;
       const label = document.createElement('label');
       label.innerText = name;
       const selectorDiv = document.createElement('div');
       selectorDiv.appendChild(checkBox);
       selectorDiv.appendChild(label);
       this.legendControls.appendChild(selectorDiv);

       checkBox.addEventListener('change', e => {
            this.markers.forEach(marker => marker.setMap(e.target.checked ? this.map : null))
       });
    }
}

var im = new InteractiveMap();