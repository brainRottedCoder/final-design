'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Use require + any casts to avoid TypeScript type issues without @types/leaflet
// eslint-disable-next-line @typescript-eslint/no-var-requires
const L: any = require('leaflet');

export type StationType = 'Discharge' | 'AWS' | 'Rain Gauge';

export interface Station {
  type: StationType;
  name: string;
  lat: number;
  lon: number;
}

// Fix default marker icons for Leaflet in bundlers like Next.js
const iconBase = {
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};

const BLUE_ICON = L.icon({
  ...iconBase,
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
});

// Use non-blue colors for AWS and Rain Gauge
const ORANGE_ICON = L.icon({
  ...iconBase,
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
});

const VIOLET_ICON = L.icon({
  ...iconBase,
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
});

L.Marker.prototype.options.icon = BLUE_ICON;

const TYPE_COLORS: Record<StationType, string> = {
  Discharge: '#1d4ed8', // blue
  AWS: '#ea580c', // orange
  'Rain Gauge': '#7c3aed', // violet
};

// Base icons (normal state)
const TYPE_ICONS: Record<StationType, any> = {
  Discharge: BLUE_ICON,
  AWS: ORANGE_ICON,
  'Rain Gauge': VIOLET_ICON,
};

// Strongly different / larger variants for selected markers
const TYPE_SELECTED_ICONS: Record<StationType, any> = {
  Discharge: L.icon({
    ...(BLUE_ICON.options || {}),
    // much larger
    iconSize: [40, 64],
    // vivid cyan so it looks clearly different from normal blue
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-cyan.png',
  }),
  AWS: L.icon({
    ...(ORANGE_ICON.options || {}),
    iconSize: [40, 64],
    // bright yellow instead of orange
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  }),
  'Rain Gauge': L.icon({
    ...(VIOLET_ICON.options || {}),
    iconSize: [40, 64],
    // bright red instead of violet
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  }),
};

interface StationsMapProps {
  center: { lat: number; lon: number };
  stations: Station[];
  selectedStationName?: string | null;
}

export default function StationsMap({ center, stations, selectedStationName }: StationsMapProps) {
  const router = useRouter();
  // Ensure leaflet CSS is loaded once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.querySelector("link[data-leaflet]");
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet', 'true');
      document.head.appendChild(link);
    }
  }, []);

  const centerPosition: [number, number] = [center.lat, center.lon];

  return (
    <MapContainer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      center={centerPosition}
      zoom={10}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' as any}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((s) => {
        const position: [number, number] = [s.lat, s.lon];
        const isSelected = selectedStationName === s.name;
        const baseIcon = TYPE_ICONS[s.type];
        const selectedIcon = TYPE_SELECTED_ICONS[s.type];
        const icon = isSelected ? selectedIcon : baseIcon;
        return (
          <Marker key={s.name} position={position} icon={icon}>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent>
              <span className="text-[11px] font-semibold">{s.name}</span>
            </Tooltip>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-semibold">{s.name}</div>
                <div style={{ color: TYPE_COLORS[s.type] }}>{s.type}</div>
                <div className="text-[11px] text-gray-600">
                  Lat: {s.lat.toFixed(5)}, Lon: {s.lon.toFixed(5)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (s.type === 'AWS') {
                      router.push(`/overview?tab=aws&station=${encodeURIComponent(s.name)}`);
                    } else {
                      router.push('/overview');
                    }
                  }}
                  className="mt-1 inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                >
                  See data
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
