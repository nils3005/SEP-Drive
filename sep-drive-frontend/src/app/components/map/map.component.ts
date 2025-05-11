import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import {GeocodeFeature, GeoJsonRoute} from "../../types";
import {routes} from "../../app.routes";
import {GeoServiceService} from "../../services/geo-service.service";

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

  constructor(private geoService: GeoServiceService) {
    this.geoService = geoService;
  }

  private map: L.Map | undefined;

  routeLayer: L.LayerGroup = L.layerGroup();
  markerLayer: L.LayerGroup = L.layerGroup();

  private initMap(): void {
    this.map = L.map('map', {
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
    tiles.addTo(this.map);
    this.routeLayer = this.routeLayer.addTo(this.map)
    this.markerLayer = this.markerLayer.addTo(this.map)
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
        this.map?.flyTo([currentPoint.geometry.coordinates[1], currentPoint.geometry.coordinates[0]],
            14,
            {
              duration: 1
            }
        )
      }
    })
    this.geoService.route.asObservable().subscribe(route => {
      if (route && this.map) {
        this.routeLayer.clearLayers()
        L.geoJSON(route, {
          style: {
            weight: 5
          }
        }).addTo(this.routeLayer)
        this.map.fitBounds(L.geoJSON(route).getBounds())
        let routeJson: GeoJsonRoute = route;
        console.log(routeJson.features[0].properties.summary.distance / 1000 + "km")
        console.log(routeJson.features[0].properties.summary.duration / 60 + "min")
      }
    })
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['route'] && changes['route'] !== undefined) {
  //     if (this.route && this.map && this.routeLayer) {
  //       this.routeLayer.clearLayers()
  //       L.geoJSON(this.route, {
  //         style: {
  //           weight: 5
  //         }
  //       }).addTo(this.routeLayer)
  //       this.map.fitBounds(L.geoJSON(this.route).getBounds())
  //       let routeJson: GeoJsonRoute = this.route;
  //       console.log(routeJson.features[0].properties.summary.distance / 1000 + "km")
  //       console.log(routeJson.features[0].properties.summary.duration / 60 + "min")
  //     }
  //   }
  //   if (changes['waypoints'] && changes['waypoints'] !== undefined && !changes['waypoints'].firstChange) {
  //     if (this.routeLayer) {
  //       this.routeLayer.clearLayers()
  //       this.markerLayer.clearLayers()
  //       for (const waypoint of this.waypoints) {
  //         if (waypoint) {
  //           let marker = L.marker(
  //               [
  //                 waypoint.geometry.coordinates[1],
  //                 waypoint.geometry.coordinates[0]
  //               ]
  //           );
  //           marker.addTo(this.markerLayer)
  //         }
  //       }
  //       if (this.currentPoint) {
  //         this.map?.flyTo([this.currentPoint.geometry.coordinates[1], this.currentPoint.geometry.coordinates[0]],
  //             14,
  //             {
  //               duration: 1
  //             }
  //         )
  //       }
  //     }
  //   }
  // }
}
