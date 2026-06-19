import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Project } from '../types';

interface ProjectMapProps {
  projects: Project[];
  onProjectSelect: (id: string) => void;
}

// Coordinates mapping based on typical locations matching the mock data
const coordsMapping: Record<string, [number, number]> = {
  "Nairobi, Kenya": [-1.286389, 36.817223],
  "Karen, Nairobi": [-1.3411, 36.7028],
  "Mombasa, Kenya": [-4.0351, 39.6642],
  "Kisumu, Kenya": [-0.0917, 34.768],
  "Eldoret, Kenya": [0.5143, 35.2697],
  "Naivasha, Kenya": [-0.7171, 36.431]
};

// Fix for default marker icons in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ProjectMap({ projects, onProjectSelect }: ProjectMapProps) {
  const defaultCenter: [number, number] = [-0.0236, 37.9062]; // Kenya center

  return (
    <div className="w-full h-[600px] border border-charcoal/10 dark:border-concrete/10 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects.map((project) => {
          const coords = coordsMapping[project.location];
          if (!coords) return null;

          return (
            <Marker 
              key={project.id} 
              position={coords}
              eventHandlers={{
                click: () => onProjectSelect(project.id),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm uppercase mb-1">{project.title}</h3>
                  <div className="text-xs text-gray-500 mb-2">{project.location}</div>
                  <img 
                    src={project.img} 
                    alt={project.title} 
                    className="w-full h-24 object-cover mb-2"
                  />
                  <button 
                    onClick={() => onProjectSelect(project.id)}
                    className="text-[10px] font-bold uppercase text-accent hover:underline"
                  >
                    View Project Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Decorative Technical Overlays */}
      <div className="absolute top-4 left-4 z-[1000] p-3 bg-charcoal/90 backdrop-blur-md border border-accent/20">
        <div className="text-[10px] font-mono text-concrete/50 mb-1 uppercase tracking-widest">Map Index</div>
        <div className="text-xs font-bold text-concrete uppercase">Geographic Distribution // {projects.length} Nodes</div>
      </div>
    </div>
  );
}
