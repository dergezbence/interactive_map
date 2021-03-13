import { kml } from "@tmcw/togeojson";

class InteractiveMap {

    constructor() {
        window.initMap = this.initMap;
    }

    initMap = () => {
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: { lat: 40.73663275920072, lng: -75.09917505322835 },
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            draggable: false
        });
        this.loadLayers();
        this.showLayers();
        this.showLegends();
        this.markers = [];
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

    loadLayers = () => {
        this.layers = {
            alt: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-alt-paddle.kmz', {preserveViewport:true}),
            full: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-full-paddle.kmz', {preserveViewport:true}),
        }
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

          marker.addListener("click", () => infowindow.open(this.map, marker));

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

    showLayers = () => {
        this.layers.full.setMap(this.map);
        this.layers.alt.setMap(this.map);

        this.renderLayerSelector(this.layers.full, "Full lake paddle");
        this.renderLayerSelector(this.layers.alt, "Recommended paddle");

        // to be able to reference the different markers in the legend layer, its loaded from a KML file
        fetch("./doc.kml")
        .then(function(response) {
            return response.text();
        })
        .then((xml) => {
            this.features = kml(new DOMParser().parseFromString(xml, "text/xml")).features;
            this.renderLegends();
        });
    }

    renderLayerSelector = (layer, name) => {
       const checkBox = document.createElement('input');
       checkBox.setAttribute('type', 'checkbox');
       checkBox.checked = true;
       checkBox.addEventListener('change', e => {
            layer.setMap(e.target.checked ? this.map : null);
       });

       const label = document.createElement('label');
       label.innerText = name;

       const selectorDiv = document.createElement('div');
       selectorDiv.appendChild(checkBox);
       selectorDiv.appendChild(label);

       const controls = document.getElementById('controls');
       controls.appendChild(selectorDiv);
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

       const controls = document.getElementById('controls');
       controls.appendChild(selectorDiv);
    }

    showLegends = () => {
        var legend = document.getElementById('mapLegend');
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
    }
}

var im = new InteractiveMap();