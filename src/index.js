import { kml } from "@tmcw/togeojson";
import './map_style.css';

class InteractiveMap {
 
    constructor() {
        this.rightPanel = document.getElementById('right_panel');
        this.controls = document.getElementById('controls');
        this.fullPaddleDescription = document.getElementById('full_paddle_description');
        this.recommendedPaddleDescription = document.getElementById('recommended_paddle_description');
        window.initMap = this.initMap;
        
        this.rightPanel.removeChild(this.fullPaddleDescription); // initially the recommended paddle is checked
    }

    initMap = () => {
        this.map = this.createMap();
        this.loadLayers();
        this.renderLayers();
        this.renderLayerSelectors();
        this.loadLegend();
        this.showLegend();
        this.markers = [];
    }

    createMap = () => {
        return new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: { lat: 40.73663275920072, lng: -75.10072000562093 },
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            draggable: false
        });
    }

    loadLayers = () => {
        this.layers = {
            alt: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-alt-paddle.kmz', {preserveViewport:true}),
            full: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-full-paddle.kmz', {preserveViewport:true}),
        }
    }

    renderLayers = () => {
        //this.layers.full.setMap(this.map);
        this.layers.alt.setMap(this.map);
    }

    loadLegend = () => {
        // to be able to reference the different markers in the legend layer, its loaded from a KML file
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

    renderLayerSelectors = () => {
        const fullCheckBox = document.createElement('input');
        fullCheckBox.setAttribute('type', 'checkbox');
        fullCheckBox.checked = false;
        const fullLabel = document.createElement('label');
        fullLabel.innerText = "Full lake paddle";
        const fullSelectorDiv = document.createElement('div');
        fullSelectorDiv.appendChild(fullCheckBox);
        fullSelectorDiv.appendChild(fullLabel);

        const altCheckBox = document.createElement('input');
        altCheckBox.setAttribute('type', 'checkbox');
        altCheckBox.checked = true;
        const altLabel = document.createElement('label');
        altLabel.innerText = "Recommended paddle";
        const altSelectorDiv = document.createElement('div');
        altSelectorDiv.appendChild(altCheckBox);
        altSelectorDiv.appendChild(altLabel);

        fullCheckBox.addEventListener('change', e => {
            this.layers.full.setMap(e.target.checked ? this.map : null);

            e.target.checked ? 
            this.rightPanel.appendChild(this.fullPaddleDescription) : 
            this.rightPanel.removeChild(this.fullPaddleDescription);

            if(altCheckBox.checked === e.target.checked){
                altCheckBox.checked = !e.target.checked;
                altCheckBox.dispatchEvent(new Event('change'));
            }
        });

        altCheckBox.addEventListener('change', e => {
            this.layers.alt.setMap(e.target.checked ? this.map : null);

            e.target.checked ? 
            this.rightPanel.appendChild(this.recommendedPaddleDescription) : 
            this.rightPanel.removeChild(this.recommendedPaddleDescription);
           
            if(fullCheckBox.checked === e.target.checked){
                fullCheckBox.checked = !e.target.checked;
                fullCheckBox.dispatchEvent(new Event('change'));
            }
        });
        
        
        this.controls.appendChild(fullSelectorDiv);
        this.controls.appendChild(altSelectorDiv);
     }

    renderLegends = () => {
        let legendContainer = document.getElementById('mapLegend');
        this.features.forEach(feature => {
            
            let legendEntry = document.createElement('div');
            let image = document.createElement('img');
            image.setAttribute('src', feature.properties.icon)
            
            legendEntry.appendChild(image);
            let label = document.createElement('span');
            label.innerText = feature.properties.name;
            legendEntry.appendChild(label);
            legendContainer.appendChild(legendEntry);

            this.createMarker(feature, image);
            
        });
        this.renderLegendSelector('Legends');
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

          if(!feature.properties.description){
            feature.properties.description = '';
          }

          const contentString =
          '<div id="content">' +
          '<div id="siteNotice">' +
          "</div>" +
          '<h3 id="firstHeading" class="firstHeading">' + feature.properties.name +'</h3>' +
          '<div id="bodyContent">' +
          feature.properties.description +
          "</div>" +
          "</div>";


          const infowindow = new google.maps.InfoWindow({
            content: contentString,
          });

          marker.addListener("click", () => {
              infowindow.open(this.map, marker);
              //window.setTimeout(() => this.map.setCenter({ lat: 40.73663275920072, lng: -75.10072000562093 }), 200); 
          });

          if(legend){
            legend.addEventListener("click", () => {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                window.setTimeout(() => {
                    marker.setAnimation(null)
                  }, 3000);
              });
          }
          this.markers.push(marker);
    }

    renderLegendSelector = (name) => {
       const checkBox = document.createElement('input');
       checkBox.setAttribute('type', 'checkbox');
       checkBox.checked = true;
       checkBox.addEventListener('change', e => {
            this.markers.forEach(marker => {
                marker.setMap(e.target.checked ? this.map : null);
            })
        
       });

       const label = document.createElement('label');
       label.innerText = name;

       const selectorDiv = document.createElement('div');
       selectorDiv.appendChild(checkBox);
       selectorDiv.appendChild(label);

       this.controls.appendChild(selectorDiv);
    }
}

var im = new InteractiveMap();