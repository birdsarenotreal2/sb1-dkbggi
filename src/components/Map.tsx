import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Location, MapState } from '../types/maps';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  locations: Location[];
  routePolyline?: [number, number][];
  initialState: MapState;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export default function Map({ locations, routePolyline, initialState }: MapProps) {
  const center: [number, number] = [initialState.center.lat, initialState.center.lng];
  
  return (
    <MapContainer
      center={center}
      zoom={initialState.zoom}
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg"
    >
      <MapController center={center} zoom={initialState.zoom} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {locations.map((location, index) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          title={location.name}
        >
        </Marker>
      ))}
      
      {routePolyline && (
        <Polyline
          positions={routePolyline}
          color="red"
          weight={3}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
}