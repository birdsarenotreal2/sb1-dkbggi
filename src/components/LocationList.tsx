import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, MapPin, Trash2 } from 'lucide-react';
import type { Location } from '../types/maps';

interface LocationListProps {
  locations: Location[];
  onReorder: (locations: Location[]) => void;
  onTimeChange: (id: string, type: 'arrival' | 'departure', time: Date | undefined) => void;
  onRemove: (id: string) => void;
}

export default function LocationList({ locations, onReorder, onTimeChange, onRemove }: LocationListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="locations">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {locations.map((location, index) => (
              <Draggable key={location.id} draggableId={location.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white rounded-lg shadow p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-blue-500" />
                        <span className="font-medium">{location.name}</span>
                      </div>
                      <button
                        onClick={() => onRemove(location.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">{location.address}</div>
                    
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-500" />
                        <input
                          type="datetime-local"
                          value={location.arrivalTime?.toISOString().slice(0, 16) || ''}
                          onChange={(e) => onTimeChange(
                            location.id,
                            'arrival',
                            e.target.value ? new Date(e.target.value) : undefined
                          )}
                          className="text-sm border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-500" />
                        <input
                          type="datetime-local"
                          value={location.departureTime?.toISOString().slice(0, 16) || ''}
                          onChange={(e) => onTimeChange(
                            location.id,
                            'departure',
                            e.target.value ? new Date(e.target.value) : undefined
                          )}
                          className="text-sm border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}