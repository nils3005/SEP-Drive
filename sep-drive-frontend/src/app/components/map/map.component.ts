import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import {GeoJsonRoute} from "../../types";
import {GeoService} from "../../services/geo/geo.service";

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
export class MapComponent implements AfterViewInit {

  constructor(private geoService: GeoService) {
    this.geoService = geoService;
  }

  routeLayer: L.LayerGroup = L.layerGroup();
  markerLayer: L.LayerGroup = L.layerGroup();

  private initMap(): void {
    this.geoService.map = L.map('map', {
      center: [51.1657, 10.4515],
      zoom: 6,
    });

    const tiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          minZoom: 3,
          attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
    );
    tiles.addTo(this.geoService.map);
    this.routeLayer = this.routeLayer.addTo(this.geoService.map);
    this.markerLayer = this.markerLayer.addTo(this.geoService.map);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.checkChanges()
  }

  checkChanges(): void {
    this.geoService.waypoints.asObservable().subscribe(waypoints => {
        this.routeLayer.clearLayers()
        this.markerLayer.clearLayers()
        for (const waypoint of this.geoService.waypoints.getValue()) {
          if (waypoint) {
            let marker = L.marker(
                [
                  waypoint.geometry.coordinates[1],
                  waypoint.geometry.coordinates[0]
                ]
            );
            marker.addTo(this.markerLayer)
          }
        }
    })
    this.geoService.currentPoint.asObservable().subscribe(currentPoint => {
      if (currentPoint) {
        this.routeLayer.clearLayers()
        this.geoService.map?.flyTo([currentPoint.geometry.coordinates[1], currentPoint.geometry.coordinates[0]],
            14,
            {
              duration: 1
            }
        )
      }
    })
    this.geoService.route.asObservable().subscribe(route => {
      if (route && this.geoService.map) {
        this.routeLayer.clearLayers()
        L.geoJSON(route, {
          style: {
            weight: 5
          }
        }).addTo(this.routeLayer)
        this.geoService.map.fitBounds(L.geoJSON(route).getBounds())
      }
    })
  }
}
