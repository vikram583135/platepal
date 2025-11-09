'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAdminAuthStatus } from '@/store';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';
import EcosystemHeatmap from '@/components/EcosystemHeatmap';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function HeatmapPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    dispatch(checkAdminAuthStatus());
    fetchHeatmapData();
  }, [dispatch]);

  const fetchHeatmapData = async () => {
    setLoadingData(true);
    try {
      // In production, this would fetch from the API
      // For now, using mock data with real coordinates
      const mockData = {
        orders: [
          { id: '1', lat: 28.6139, lng: 77.2090, value: 45, timestamp: new Date().toISOString() }, // New Delhi
          { id: '2', lat: 28.6139, lng: 77.2090, value: 38, timestamp: new Date().toISOString() },
          { id: '3', lat: 19.0760, lng: 72.8777, value: 52, timestamp: new Date().toISOString() }, // Mumbai
          { id: '4', lat: 19.0760, lng: 72.8777, value: 41, timestamp: new Date().toISOString() },
          { id: '5', lat: 12.9716, lng: 77.5946, value: 35, timestamp: new Date().toISOString() }, // Bangalore
          { id: '6', lat: 12.9716, lng: 77.5946, value: 29, timestamp: new Date().toISOString() },
          { id: '7', lat: 22.5726, lng: 88.3639, value: 48, timestamp: new Date().toISOString() }, // Kolkata
          { id: '8', lat: 18.5204, lng: 73.8567, value: 31, timestamp: new Date().toISOString() }, // Pune
        ],
        drivers: [
          { id: 'd1', lat: 28.6139, lng: 77.2090, status: 'available', name: 'Driver 1' },
          { id: 'd2', lat: 28.6200, lng: 77.2100, status: 'busy', name: 'Driver 2' },
          { id: 'd3', lat: 19.0760, lng: 72.8777, status: 'available', name: 'Driver 3' },
          { id: 'd4', lat: 19.0800, lng: 72.8800, status: 'available', name: 'Driver 4' },
          { id: 'd5', lat: 12.9716, lng: 77.5946, status: 'busy', name: 'Driver 5' },
          { id: 'd6', lat: 22.5726, lng: 88.3639, status: 'available', name: 'Driver 6' },
        ],
        restaurants: [
          { id: 'r1', lat: 28.6139, lng: 77.2090, name: 'Pizza Palace', status: 'active' },
          { id: 'r2', lat: 19.0760, lng: 72.8777, name: 'Burger King', status: 'active' },
          { id: 'r3', lat: 12.9716, lng: 77.5946, name: 'Sushi Master', status: 'active' },
          { id: 'r4', lat: 22.5726, lng: 88.3639, name: 'Indian Delight', status: 'active' },
        ],
        coverageGaps: [
          { lat: 28.6500, lng: 77.2500, severity: 'high', description: 'High demand, low coverage' },
          { lat: 19.1000, lng: 72.9000, severity: 'medium', description: 'Growing demand area' },
          { lat: 12.9500, lng: 77.5500, severity: 'low', description: 'Potential expansion zone' },
        ],
      };
      setHeatmapData(mockData);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Ecosystem Heatmap</h1>
            <p className="text-text-secondary mt-1">Live visualization of platform activity</p>
          </div>
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ecosystem Heatmap</h1>
          <p className="text-text-secondary mt-1">
            AI-driven visualization of order density, driver availability, and demand/coverage gaps
          </p>
        </div>

        {/* Heatmap Component */}
        {heatmapData && <EcosystemHeatmap data={heatmapData} />}
      </div>
    </DashboardLayout>
  );
}
