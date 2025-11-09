'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface GlanceableMapProps {
  pickupLocation: Location;
  deliveryLocation: Location;
  currentLocation?: Location;
  onLocationUpdate?: (location: Location) => void;
  className?: string;
}

export default function GlanceableMap({
  pickupLocation,
  deliveryLocation,
  currentLocation,
  onLocationUpdate,
  className = '',
}: GlanceableMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(currentLocation || null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Watch position for real-time updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000, // Update every 5 seconds
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onLocationUpdate]);

  // Generate Google Maps URL for embedded map
  const getMapUrl = () => {
    if (!userLocation) {
      // Show route from pickup to delivery if no user location
      return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyDummyKey&origin=${pickupLocation.lat},${pickupLocation.lng}&destination=${deliveryLocation.lat},${deliveryLocation.lng}&mode=driving`;
    }
    
    // Show route from current location to destination
    const destination = userLocation.lat === pickupLocation.lat && userLocation.lng === pickupLocation.lng
      ? deliveryLocation
      : pickupLocation;
    
    return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyDummyKey&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}&mode=driving`;
  };

  // Fallback: Use Google Maps static image or iframe
  // Note: In production, you'd need a valid Google Maps API key
  const getMapImageUrl = () => {
    const center = userLocation || pickupLocation;
    const size = '800x600';
    const zoom = 15;
    const markers = [
      `color:green|label:P|${pickupLocation.lat},${pickupLocation.lng}`,
      `color:red|label:D|${deliveryLocation.lat},${deliveryLocation.lng}`,
    ];
    
    if (userLocation) {
      markers.push(`color:blue|label:Y|${userLocation.lat},${userLocation.lng}`);
    }

    return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}&markers=${markers.join('&markers=')}&key=AIzaSyDummyKey`;
  };

  return (
    <div 
      ref={mapRef}
      className={`relative w-full h-full bg-neutral-surface ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Map Placeholder - In production, integrate with Google Maps, Mapbox, or Leaflet */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-light/20 to-primary/10">
        <div className="text-center">
          <MapPin size={48} className="text-primary/50 mx-auto mb-4" />
          <p className="text-sm text-neutral-text-secondary font-medium">
            Map View
          </p>
          <p className="text-xs text-neutral-text-secondary mt-2">
            {locationError || 'Loading map...'}
          </p>
        </div>
      </div>

      {/* Map Overlay Info - Current Location */}
      {userLocation && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Navigation size={14} className="text-primary" />
            <span>Tracking location</span>
          </div>
        </div>
      )}

      {/* Map Overlay Info - Error */}
      {locationError && (
        <div className="absolute top-4 left-4 bg-error/90 text-white px-3 py-2 rounded-lg text-xs">
          <p>{locationError}</p>
        </div>
      )}

      {/* Note for production implementation */}
      <div className="sr-only">
        <p>
          In production, integrate with a mapping service:
          - Google Maps JavaScript API
          - Mapbox GL JS
          - Leaflet with OpenStreetMap
        </p>
        <p>
          Current location: {userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Not available'}
        </p>
        <p>
          Pickup: {pickupLocation.lat}, {pickupLocation.lng}
        </p>
        <p>
          Delivery: {deliveryLocation.lat}, {deliveryLocation.lng}
        </p>
      </div>
    </div>
  );
}

