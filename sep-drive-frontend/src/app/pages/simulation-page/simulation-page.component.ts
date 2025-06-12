import { Component } from '@angular/core';
import {MapComponent} from "../../components/map/map.component";
import {RideRequestSummaryComponent} from "../../components/ride-request-summary/ride-request-summary.component";
import {RouteInputComponent} from "../../components/route-input/route-input.component";
import {RideSimulationComponent} from '../../components/ride-simulation/ride-simulation.component';

@Component({
  selector: 'app-simulation-page',
  imports: [
    MapComponent,
    RideRequestSummaryComponent,
    RouteInputComponent,
    RideSimulationComponent
  ],
  templateUrl: './simulation-page.component.html',
  styleUrl: './simulation-page.component.scss'
})
export class SimulationPageComponent {

}
