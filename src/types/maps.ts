export interface Location {
  id: string;
  name: string;
  address: string;
  placeId: string;
  lat: number;
  lng: number;
  arrivalTime?: Date;
  departureTime?: Date;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  trafficDuration: string;
  cost: number;
}

export interface MapState {
  zoom: number;
  tilt: number;
  heading: number;
  center: {
    lat: number;
    lng: number;
  };
}