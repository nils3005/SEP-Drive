import {AfterViewInit, Component} from '@angular/core';
import * as L from 'leaflet';
import {GeoService} from "../../services/geo/geo.service";
import {GeoStoreService} from '../../stores/geo/geo-store.service';

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

  constructor(private geoStoreService: GeoStoreService) {
  }

  private initMap(): void {
    this.geoStoreService.map = L.map('map', {
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
    tiles.addTo(this.geoStoreService.map);
    this.geoStoreService.routeLayer = this.geoStoreService.routeLayer.addTo(this.geoStoreService.map);
    this.geoStoreService.startLayer = this.geoStoreService.startLayer.addTo(this.geoStoreService.map);
    this.geoStoreService.stoppsLayer = this.geoStoreService.stoppsLayer.addTo(this.geoStoreService.map);
    this.geoStoreService.destinationLayer = this.geoStoreService.destinationLayer.addTo(this.geoStoreService.map);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.checkChanges()
  }

  checkChanges(): void {
    this.geoStoreService.stops.asObservable().subscribe(stopps => {
        // this.geoStoreService.routeLayer.clearLayers()
        // this.geoStoreService.stoppsLayer.clearLayers()
        for (const stopp of stopps) {
          if (stopp) {
            let marker = L.marker(
                [
                  stopp.geometry.coordinates[1],
                  stopp.geometry.coordinates[0]
                ]
            );
            marker.addTo(this.geoStoreService.stoppsLayer)
          }
        }
    })
    this.geoStoreService.start.asObservable().subscribe(start => {
      this.geoStoreService.routeLayer.clearLayers()
      this.geoStoreService.startLayer.clearLayers()
      if (start) {
        let marker = L.marker(
          [
            start.geometry.coordinates[1],
            start.geometry.coordinates[0]
          ]
        );
        marker.addTo(this.geoStoreService.startLayer)
      }
    })
    if (this.geoStoreService.destination.asObservable().subscribe(destination => {
      this.geoStoreService.routeLayer.clearLayers()
      this.geoStoreService.destinationLayer.clearLayers()
      if (destination) {
        let marker = L.marker(
          [
            destination.geometry.coordinates[1],
            destination.geometry.coordinates[0]
          ]
        );
        marker.addTo(this.geoStoreService.destinationLayer)
      }
    }))
    this.geoStoreService.currentPoint.asObservable().subscribe(currentPoint => {
      if (currentPoint) {
        this.geoStoreService.routeLayer.clearLayers()
        this.geoStoreService.map?.flyTo([currentPoint.geometry.coordinates[1], currentPoint.geometry.coordinates[0]],
            14,
            {
              duration: 1
            }
        )
      }
    })
    this.geoStoreService.route.asObservable().subscribe(route => {
      if (route && this.geoStoreService.map) {
        this.geoStoreService.routeLayer.clearLayers()
        L.geoJSON(route, {
          style: {
            weight: 5
          }
        }).addTo(this.geoStoreService.routeLayer)
        this.geoStoreService.map.fitBounds(L.geoJSON(route).getBounds())
      }
    })
  }
}
