import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import Globe from './components/Globe';
import LocationList from './components/LocationList';
import RouteDetails from './components/RouteDetails';
import type { Location, RouteInfo, MapState } from './types/maps';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const initialMapState: MapState = {
  zoom: 2,
  tilt: 0,
  heading: 0,
  center: { lat: 0, lng: 0 }
};

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    distance: '',
    duration: '',
    trafficDuration: '',
    cost: 0
  });
  const [mapState, setMapState] = useState<MapState>(initialMapState);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);

  const handleSearch = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        q: searchInput,
        format: 'json',
        limit: '1'
      });

      const response = await fetch(`${NOMINATIM_API}?${params}`);
      const results = await response.json();

      if (results && results[0]) {
        const place = results[0];
        const newLocation: Location = {
          id: Date.now().toString(),
          name: place.display_name.split(',')[0],
          address: place.display_name,
          placeId: place.place_id,
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        };
        setLocations(prev => [...prev, newLocation]);
        setSearchInput('');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error finding location. Please try again.');
    }
  }, [searchInput]);

  const calculateRoute = useCallback(async () => {
    if (locations.length < 2) return;

    try {
      const coordinates = locations.map(loc => `${loc.lng},${loc.lat}`).join(';');
      const response = await fetch(`${OSRM_API}/${coordinates}?overview=full&geometries=geojson`);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng] as [number, number]);
        
        setRoutePolyline(coordinates);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1) + ' km',
          duration: (route.duration / 60).toFixed(0) + ' mins',
          trafficDuration: (route.duration / 60).toFixed(0) + ' mins',
          cost: estimateTripCost(route.distance / 1000)
        });

        setMapState({
          ...mapState,
          zoom: 12,
          center: {
            lat: coordinates[0][0],
            lng: coordinates[0][1]
          }
        });
      }
    } catch (error) {
      console.error('Routing error:', error);
      alert('Error calculating route. Please try again.');
    }
  }, [locations, mapState]);

  const estimateTripCost = (distanceKm: number) => {
    const fuelCostPerKm = 0.15;
    return distanceKm * fuelCostPerKm;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg h-[600px]">
              <Globe
                locations={locations}
                routePolyline={routePolyline}
                initialState={mapState}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for a location"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            <LocationList
              locations={locations}
              onReorder={setLocations}
              onTimeChange={(id, type, time) => {
                setLocations(prev => prev.map(loc => {
                  if (loc.id === id) {
                    return {
                      ...loc,
                      [type === 'arrival' ? 'arrivalTime' : 'departureTime']: time
                    };
                  }
                  return loc;
                }));
              }}
              onRemove={(id) => {
                setLocations(prev => prev.filter(loc => loc.id !== id));
              }}
            />

            {locations.length >= 2 && (
              <>
                <button
                  onClick={calculateRoute}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Calculate Route
                </button>
                
                {routeInfo.distance && <RouteDetails routeInfo={routeInfo} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;