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
    id: string,
    name: string,
    housenumber: string,
    street: string,
    postalcode: string,
    country: string,
    region: string,
    locality: string,
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
