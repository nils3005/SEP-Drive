import {RideRequestStatus} from "./enums/ride-request-status";
import {CarType} from "./enums/car-type";
import {RideStatus} from './enums/ride-status';

export type NavLink = {
  id: number,
  title: string,
  active: boolean,
  link: string,
}

export type AddressAutocompleteSuggestion = {
  features: GeocodeFeature[]
}

export type GeocodeFeature = {
  geometry: {
    type: string,
    coordinates: [number, number]
  }
  properties: {
    id: string
    name: string,
    housenumber?: string | undefined,
    street?: string | undefined,
    postalcode?: string | undefined,
    country?: string | undefined,
    region?: string | undefined,
    locality?: string | undefined,
    label: string
  }
}

export type GeoJsonRoute = {
  features: [
    {
      properties: {
        summary: {
          distance: number,
          duration: number
        }
      }
    }
  ]
}

export type User = {
  id: number;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: string;
  numberOfRides: number;
  ratings: number[];
  carType: string;
  profilePicture: string;
}

export type Coordinates = {
  latitude: number | string
  longitude: number | string
}

export type RideRequest = {
  id: number
  customer: User
  startLocation: Coordinates
  destination: Coordinates
  carType: CarType
  active: boolean
}

export type RideRequestSummary = {
  start: string
  stops: GeocodeFeature[]
  end: string
  distance: number
  duration: number
  price: number
  carType: string
}


export type DriveUser = {
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  rolle: string,
  birthDate: string,
  profilePicture: string,
  password: string,
  wdhpasswort: string,
  carType: string
}

export type RideResponse = {
  ride: Ride
  coords: RideCords
  speeds: Speeds
}

export type Ride = {
  rideId: number
  driver: User
  customer: User
  speed: number
  price: number
  distance: number
  duration: number
  status: RideStatus
  coordsIndex: number
  geoJson: any
  coords: [[number, number]]
  speeds: number[]
}

export type RideCords = [[number, number]]

export type Speeds = number[]

export type RideUpdateDTO = {
  rideId: number
  paused: boolean
  resuming: boolean
  completed: boolean
  speed: number
  coordsIndex: number
  historyId: number | null
}
