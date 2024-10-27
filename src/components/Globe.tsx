import React, { useEffect, useRef, useState } from 'react';
import GlobeGL from 'globe.gl';
import { Location, MapState } from '../types/maps';
import * as d3 from 'd3';

interface GlobeProps {
  locations: Location[];
  routePolyline?: [number, number][];
  initialState: MapState;
}

export default function Globe({ locations, routePolyline, initialState }: GlobeProps) {
  const globeEl = useRef<HTMLDivElement>(null);
  const [globe, setGlobe] = useState<any>(null);

  useEffect(() => {
    if (!globeEl.current) return;

    const globe = GlobeGL()(globeEl.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .pointOfView({ lat: initialState.center.lat, lng: initialState.center.lng, altitude: 2.5 })
      .pointRadius(0.5)
      .pointColor(() => '#ff0000')
      .pointAltitude(0.1)
      .arcColor(() => '#fd1d1d')
      .arcAltitude(0.3)
      .arcStroke(0.5)
      .arcDashLength(0.5)
      .arcDashGap(0.1)
      .arcDashAnimateTime(2000);

    setGlobe(globe);

    return () => {
      if (globe) {
        globe._destructor();
      }
    };
  }, []);

  useEffect(() => {
    if (!globe) return;

    // Update points
    const points = locations.map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      size: 0.5,
      color: '#ff0000'
    }));
    globe.pointsData(points);

    // Update arcs if route exists
    if (routePolyline && routePolyline.length > 1) {
      const arcs = [];
      for (let i = 0; i < routePolyline.length - 1; i++) {
        arcs.push({
          startLat: routePolyline[i][0],
          startLng: routePolyline[i][1],
          endLat: routePolyline[i + 1][0],
          endLng: routePolyline[i + 1][1],
          color: '#fd1d1d'
        });
      }
      globe.arcsData(arcs);

      // Animate to show the full route
      if (locations.length >= 2) {
        const bounds = routePolyline.reduce(
          ([minLat, maxLat, minLng, maxLng], [lat, lng]) => [
            Math.min(minLat, lat),
            Math.max(maxLat, lat),
            Math.min(minLng, lng),
            Math.max(maxLng, lng)
          ],
          [90, -90, 180, -180]
        );

        const centerLat = (bounds[0] + bounds[1]) / 2;
        const centerLng = (bounds[2] + bounds[3]) / 2;
        const distance = d3.geoDistance(
          [bounds[2], bounds[0]],
          [bounds[3], bounds[1]]
        );
        
        globe.pointOfView({
          lat: centerLat,
          lng: centerLng,
          altitude: 1.5 + distance * 2
        }, 2000);
      }
    } else {
      globe.arcsData([]);
    }
  }, [globe, locations, routePolyline]);

  return (
    <div 
      ref={globeEl} 
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg overflow-hidden"
    />
  );
}