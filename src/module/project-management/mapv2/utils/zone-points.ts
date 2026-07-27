import { IMapZonePoint } from "../types/zone";

// Points are stored/edited as X/Y (see IMapZonePoint) - convert at the Google Maps API boundary
// only, since that's the one place a {lat, lng}-shaped literal is required.
export const toLatLng = (point: IMapZonePoint): google.maps.LatLngLiteral => ({ lat: point.Y, lng: point.X });

export const toMapZonePoint = (latLng: google.maps.LatLngLiteral): IMapZonePoint => ({ X: latLng.lng, Y: latLng.lat });
