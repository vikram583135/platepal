'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import Badge from './ui/Badge';
import {
  MapPinIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface HeatmapData {
  orders: Array<{
    id: string;
    lat: number;
    lng: number;
    value: number;
    timestamp: string;
  }>;
  drivers: Array<{
    id: string;
    lat: number;
    lng: number;
    status: 'available' | 'busy' | 'offline';
    name: string;
  }>;
  restaurants: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
    status: string;
  }>;
  coverageGaps: Array<{
    lat: number;
    lng: number;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
}

interface EcosystemHeatmapProps {
  data: HeatmapData;
}

// You'll need to set this in your .env.local file
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export default function EcosystemHeatmap({ data }: EcosystemHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layerVisibility, setLayerVisibility] = useState({
    orders: true,
    drivers: true,
    restaurants: true,
    gaps: true,
  });
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map centered on India
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.2090, 28.6139], // New Delhi
      zoom: 5,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      setupLayers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && mapLoaded) {
      updateLayers();
    }
  }, [data, layerVisibility, mapLoaded]);

  const setupLayers = () => {
    if (!map.current) return;

    // Add order density heatmap
    map.current.addSource('orders', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.orders.map((order) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [order.lng, order.lat],
          },
          properties: {
            value: order.value,
          },
        })),
      },
    });

    // Add order density heatmap layer
    map.current.addLayer({
      id: 'order-heatmap',
      type: 'heatmap',
      source: 'orders',
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          0,
          0,
          100,
          1,
        ],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33, 102, 172, 0)',
          0.2,
          'rgb(103, 169, 207)',
          0.4,
          'rgb(209, 229, 240)',
          0.6,
          'rgb(253, 219, 199)',
          0.8,
          'rgb(239, 138, 98)',
          1,
          'rgb(178, 24, 43)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
        'heatmap-opacity': layerVisibility.orders ? 0.6 : 0,
      },
    });

    // Add order points
    map.current.addLayer({
      id: 'order-points',
      type: 'circle',
      source: 'orders',
      minzoom: 10,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 10],
        'circle-color': '#3b82f6',
        'circle-opacity': layerVisibility.orders ? 0.8 : 0,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });

    // Add drivers source
    map.current.addSource('drivers', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.drivers.map((driver) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [driver.lng, driver.lat],
          },
          properties: {
            id: driver.id,
            status: driver.status,
            name: driver.name,
          },
        })),
      },
    });

    // Add drivers layer
    map.current.addLayer({
      id: 'drivers',
      type: 'circle',
      source: 'drivers',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'status'],
          'available',
          '#10b981',
          'busy',
          '#f59e0b',
          '#6b7280',
        ],
        'circle-opacity': layerVisibility.drivers ? 0.9 : 0,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Add restaurants source
    map.current.addSource('restaurants', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.restaurants.map((restaurant) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [restaurant.lng, restaurant.lat],
          },
          properties: {
            id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status,
          },
        })),
      },
    });

    // Add restaurants layer
    map.current.addLayer({
      id: 'restaurants',
      type: 'circle',
      source: 'restaurants',
      paint: {
        'circle-radius': 10,
        'circle-color': '#8b5cf6',
        'circle-opacity': layerVisibility.restaurants ? 0.9 : 0,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });

    // Add coverage gaps source
    map.current.addSource('gaps', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.coverageGaps.map((gap) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [gap.lng, gap.lat],
          },
          properties: {
            severity: gap.severity,
            description: gap.description,
          },
        })),
      },
    });

    // Add coverage gaps layer
    map.current.addLayer({
      id: 'gaps',
      type: 'circle',
      source: 'gaps',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          5,
          15,
          10,
          40,
        ],
        'circle-color': [
          'match',
          ['get', 'severity'],
          'high',
          '#ef4444',
          'medium',
          '#f59e0b',
          '#eab308',
        ],
        'circle-opacity': layerVisibility.gaps ? 0.4 : 0,
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'match',
          ['get', 'severity'],
          'high',
          '#dc2626',
          'medium',
          '#d97706',
          '#ca8a04',
        ],
        'circle-stroke-opacity': layerVisibility.gaps ? 0.8 : 0,
      },
    });

    // Add popups on click
    map.current.on('click', 'drivers', (e) => {
      const feature = e.features?.[0];
      if (feature && map.current) {
        new mapboxgl.Popup()
          .setLngLat([feature.geometry.type === 'Point' ? (feature.geometry as any).coordinates[0] : 0, feature.geometry.type === 'Point' ? (feature.geometry as any).coordinates[1] : 0])
          .setHTML(
            `<div class="p-2">
              <p class="font-semibold">${feature.properties?.name}</p>
              <p class="text-sm">Status: ${feature.properties?.status}</p>
            </div>`
          )
          .addTo(map.current);
      }
    });

    map.current.on('click', 'restaurants', (e) => {
      const feature = e.features?.[0];
      if (feature && map.current) {
        new mapboxgl.Popup()
          .setLngLat([feature.geometry.type === 'Point' ? (feature.geometry as any).coordinates[0] : 0, feature.geometry.type === 'Point' ? (feature.geometry as any).coordinates[1] : 0])
          .setHTML(
            `<div class="p-2">
              <p class="font-semibold">${feature.properties?.name}</p>
              <p class="text-sm">Status: ${feature.properties?.status}</p>
            </div>`
          )
          .addTo(map.current);
      }
    });

    map.current.on('click', 'gaps', (e) => {
      const feature = e.features?.[0];
      if (feature && map.current) {
        new mapboxgl.Popup()
          .setLngLat([feature.geometry.type === 'Point' ? (feature.geometry as any).coordinates[0] : 0, feature.geometry.type === 'Point' ? (feature.geometry as any).coordinates[1] : 0])
          .setHTML(
            `<div class="p-2">
              <p class="font-semibold">Coverage Gap</p>
              <p class="text-sm">${feature.properties?.description}</p>
              <p class="text-xs mt-1">Severity: ${feature.properties?.severity}</p>
            </div>`
          )
          .addTo(map.current);
      }
    });
  };

  const updateLayers = () => {
    if (!map.current) return;

    // Update order visibility
    map.current.setLayoutProperty('order-heatmap', 'visibility', layerVisibility.orders ? 'visible' : 'none');
    map.current.setPaintProperty('order-heatmap', 'heatmap-opacity', layerVisibility.orders ? 0.6 : 0);
    map.current.setPaintProperty('order-points', 'circle-opacity', layerVisibility.orders ? 0.8 : 0);

    // Update driver visibility
    map.current.setPaintProperty('drivers', 'circle-opacity', layerVisibility.drivers ? 0.9 : 0);

    // Update restaurant visibility
    map.current.setPaintProperty('restaurants', 'circle-opacity', layerVisibility.restaurants ? 0.9 : 0);

    // Update gap visibility
    map.current.setPaintProperty('gaps', 'circle-opacity', layerVisibility.gaps ? 0.4 : 0);
    map.current.setPaintProperty('gaps', 'circle-stroke-opacity', layerVisibility.gaps ? 0.8 : 0);
  };

  const toggleLayer = (layer: keyof typeof layerVisibility) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-surface rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-text-primary mb-2">Layer Controls</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleLayer('orders')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  layerVisibility.orders
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border text-text-secondary'
                }`}
              >
                {layerVisibility.orders ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
                <span>Order Density</span>
              </button>
              <button
                onClick={() => toggleLayer('drivers')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  layerVisibility.drivers
                    ? 'bg-green-500/10 border-green-500 text-green-500'
                    : 'bg-background border-border text-text-secondary'
                }`}
              >
                {layerVisibility.drivers ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
                <span>Drivers</span>
              </button>
              <button
                onClick={() => toggleLayer('restaurants')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  layerVisibility.restaurants
                    ? 'bg-purple-500/10 border-purple-500 text-purple-500'
                    : 'bg-background border-border text-text-secondary'
                }`}
              >
                {layerVisibility.restaurants ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
                <span>Restaurants</span>
              </button>
              <button
                onClick={() => toggleLayer('gaps')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  layerVisibility.gaps
                    ? 'bg-red-500/10 border-red-500 text-red-500'
                    : 'bg-background border-border text-text-secondary'
                }`}
              >
                {layerVisibility.gaps ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
                <span>Coverage Gaps</span>
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-primary">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-white"></div>
                <span className="text-text-secondary">Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border border-white"></div>
                <span className="text-text-secondary">Available Drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500 border border-white"></div>
                <span className="text-text-secondary">Busy Drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 border border-white"></div>
                <span className="text-text-secondary">Restaurants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500/40 border-2 border-red-500"></div>
                <span className="text-text-secondary">Coverage Gaps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden" style={{ height: '600px' }}>
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPinIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-text-secondary">Active Orders</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.orders.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <TruckIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-text-secondary">Available Drivers</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.drivers.filter((d) => d.status === 'available').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <BuildingStorefrontIcon className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-text-secondary">Active Restaurants</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.restaurants.filter((r) => r.status === 'active').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-lg p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-sm text-text-secondary">Coverage Gaps</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.coverageGaps.length}</p>
          <p className="text-xs text-text-secondary mt-1">
            {data.coverageGaps.filter((g) => g.severity === 'high').length} high priority
          </p>
        </motion.div>
      </div>
    </div>
  );
}
