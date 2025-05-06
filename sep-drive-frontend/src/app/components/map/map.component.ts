import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import {GeocodeFeature, GeoJsonRoute} from "../../types";
import {routes} from "../../app.routes";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map: L.Map | undefined;
  @Input() start: GeocodeFeature | undefined;
  @Input() destination: GeocodeFeature | undefined;
  @Input() route: any;

  routeLayer: L.LayerGroup | undefined;
  startMarker: L.Marker | undefined;
  destinationMarker: L.Marker | undefined;

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.1657, 10.4515],
      zoom: 6,
    });

    this.routeLayer = L.layerGroup().addTo(this.map)

    const tiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          minZoom: 3,
          attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
    );

    tiles.addTo(this.map);
  }

  constructor() {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['start'] && changes['start'] !== undefined) {
      if (this.start && this.map && this.routeLayer) {
        this.routeLayer.clearLayers()
        this.startMarker?.removeFrom(this.map)
        L.geoJSON(this.route).removeFrom(this.map)
        this.startMarker = L.marker([this.start.geometry.coordinates[1], this.start.geometry.coordinates[0]])
        this.startMarker.addTo(this.map)
        this.map.flyTo([this.start.geometry.coordinates[1], this.start.geometry.coordinates[0]], 14, {
          duration: 1
        })
      }
    }
    if (changes['destination'] && changes['destination'] !== undefined) {
      if (this.destination && this.map && this.routeLayer) {
        this.routeLayer.clearLayers()
        this.destinationMarker?.removeFrom(this.map)
        L.geoJSON(this.route).removeFrom(this.map)
        this.destinationMarker = L.marker([this.destination.geometry.coordinates[1], this.destination.geometry.coordinates[0]])
        this.destinationMarker.addTo(this.map)
        this.map.flyTo([this.destination.geometry.coordinates[1], this.destination.geometry.coordinates[0]], 14, {
          duration: 1
        })
      }
    }
    if (changes['route'] && changes['route'] !== undefined) {
      if (this.route && this.map && this.routeLayer) {
        this.routeLayer.clearLayers()
        L.geoJSON(this.route, {
          style: {
            weight: 5
          }
        }).addTo(this.routeLayer)
        this.map.fitBounds(L.geoJSON(this.route).getBounds())
        let routeJson: GeoJsonRoute = this.route;
        console.log(routeJson.features[0].properties.summary.distance / 1000 + "km")
        console.log(routeJson.features[0].properties.summary.duration / 60 + "min")
        // console.log(routeJson)
      }
    }
  }
}
