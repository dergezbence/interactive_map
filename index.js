
class InteractiveMap {

    constructor() {
        window.initMap = this.initMap;
    }

    initMap = () => {
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: { lat: 24.886, lng: -70.268 }
        });
        this.loadLayers();
        this.showLayers();
    }

    loadLayers = () => {
        this.layers = {
            alt: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-alt-paddle.kmz'),
            full: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-full-paddle.kmz'),
            legend: new google.maps.KmlLayer('https://njpaddle.org/kmls/merill-creek-legend.kmz'),
        }
    }

    showLayers = () => {
        this.layers.full.setMap(this.map);
        this.layers.alt.setMap(this.map);
        this.layers.legend.setMap(this.map);
    }
}

var im = new InteractiveMap();