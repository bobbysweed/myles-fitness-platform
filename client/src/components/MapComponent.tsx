import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SessionLocation } from '@/lib/types';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  sessions?: SessionLocation[];
  onSessionClick?: (session: SessionLocation) => void;
  interactive?: boolean;
  className?: string;
}

export default function MapComponent({
  center,
  zoom,
  sessions = [],
  onSessionClick,
  interactive = true,
  className = "w-full h-full"
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: interactive,
      attributionControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    }).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update map center and zoom
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    sessions.forEach(session => {
      const marker = L.marker([session.latitude, session.longitude]);
      
      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-sm">${session.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${session.business}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-green-600">£${session.price}</span>
            <div class="flex items-center text-xs">
              <span class="text-yellow-500">★</span>
              <span class="ml-1">${session.rating}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">${session.difficulty} • ${session.sessionType}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      if (onSessionClick) {
        marker.on('click', () => {
          onSessionClick(session);
        });
      }

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  }, [sessions, onSessionClick]);

  return <div ref={mapRef} className={className} />;
}
