import React from 'react';
import { Clock, DollarSign, Navigation } from 'lucide-react';
import type { RouteInfo } from '../types/maps';

interface RouteDetailsProps {
  routeInfo: RouteInfo;
}

export default function RouteDetails({ routeInfo }: RouteDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Route Summary</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Navigation className="text-blue-500" />
          <span>Distance: {routeInfo.distance}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="text-green-500" />
          <span>Duration: {routeInfo.duration}</span>
          <span className="text-sm text-gray-500">
            (with traffic: {routeInfo.trafficDuration})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="text-yellow-500" />
          <span>Estimated Cost: ${routeInfo.cost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}