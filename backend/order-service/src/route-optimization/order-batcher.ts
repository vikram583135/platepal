import { Order } from '../orders/order.entity';

export interface OrderLocation {
  lat: number;
  lng: number;
}

/**
 * Generate mock pickup address from restaurant ID
 */
function getPickupAddress(order: Order): string {
  return `Restaurant ${order.restaurantId}, Address ${order.restaurantId * 10}`;
}

/**
 * Generate mock delivery address from customer ID
 */
function getDeliveryAddress(order: Order): string {
  return `Customer ${order.customerId}, Address ${order.customerId * 20}`;
}

export interface OrderBatch {
  orders: Order[];
  efficiencyScore: number;
  totalEarnings: number;
  estimatedTime: number; // in minutes
  totalDistance: number; // in kilometers
  route: string[]; // ordered list of addresses
}

export interface PartnerLocation {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  loc1: OrderLocation | PartnerLocation,
  loc2: OrderLocation | PartnerLocation
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) *
      Math.cos(toRad(loc2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse address to coordinates (mock implementation)
 * In production, use a geocoding service like Google Maps Geocoding API
 */
export function parseAddressToCoordinates(address: string): OrderLocation {
  // Mock implementation - hash address to consistent coordinates
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    lat: 28.6139 + (hash % 1000) / 10000, // Delhi area mock
    lng: 77.2090 + (hash % 500) / 10000,
  };
}

/**
 * Check if two orders are compatible for batching
 */
export function areOrdersCompatible(
  order1: Order,
  order2: Order,
  maxDistance: number = 5, // km
  maxTimeWindow: number = 30 // minutes
): boolean {
  // Same restaurant orders are always compatible
  if (order1.restaurantId === order2.restaurantId) {
    return true;
  }

  // Check proximity
  const loc1 = parseAddressToCoordinates(getDeliveryAddress(order1));
  const loc2 = parseAddressToCoordinates(getDeliveryAddress(order2));
  const distance = calculateDistance(loc1, loc2);
  
  if (distance > maxDistance) {
    return false;
  }

  // Check time window compatibility
  const timeDiff = Math.abs(
    new Date(order1.createdAt).getTime() - new Date(order2.createdAt).getTime()
  );
  const minutesDiff = timeDiff / (1000 * 60);
  
  return minutesDiff <= maxTimeWindow;
}

/**
 * Calculate optimal route using nearest neighbor algorithm
 */
export function calculateOptimalRoute(
  startLocation: PartnerLocation,
  orders: Order[]
): { route: Order[]; totalDistance: number; estimatedTime: number } {
  if (orders.length === 0) {
    return { route: [], totalDistance: 0, estimatedTime: 0 };
  }

  if (orders.length === 1) {
    const pickupLoc = parseAddressToCoordinates(getPickupAddress(orders[0]));
    const deliveryLoc = parseAddressToCoordinates(getDeliveryAddress(orders[0]));
    const distance1 = calculateDistance(startLocation, pickupLoc);
    const distance2 = calculateDistance(pickupLoc, deliveryLoc);
    return {
      route: orders,
      totalDistance: distance1 + distance2,
      estimatedTime: (distance1 + distance2) * 2, // Assume 2 min per km average
    };
  }

  // Nearest neighbor algorithm
  const route: Order[] = [];
  const remaining = [...orders];
  let currentLocation = startLocation;
  let totalDistance = 0;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    let nearestIsPickup = true;

    // Find nearest pickup or delivery location
    for (let i = 0; i < remaining.length; i++) {
      const order = remaining[i];
      
      // Check if we've picked up this order
      const alreadyPickedUp = route.some(r => r.id === order.id);
      
      if (!alreadyPickedUp) {
        // Check pickup location
        const pickupLoc = parseAddressToCoordinates(getPickupAddress(order));
        const dist = calculateDistance(currentLocation, pickupLoc);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIndex = i;
          nearestIsPickup = true;
        }
      } else {
        // Check delivery location
        const deliveryLoc = parseAddressToCoordinates(getDeliveryAddress(order));
        const dist = calculateDistance(currentLocation, deliveryLoc);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIndex = i;
          nearestIsPickup = false;
        }
      }
    }

    const nextOrder = remaining[nearestIndex];
    
    if (nearestIsPickup && !route.some(r => r.id === nextOrder.id)) {
      // Going to pickup
      const pickupLoc = parseAddressToCoordinates(getPickupAddress(nextOrder));
      totalDistance += nearestDistance;
      currentLocation = pickupLoc;
      route.push(nextOrder);
    } else {
      // Going to delivery
      const deliveryLoc = parseAddressToCoordinates(getDeliveryAddress(nextOrder));
      totalDistance += nearestDistance;
      currentLocation = deliveryLoc;
      // Remove from remaining if fully delivered
      remaining.splice(nearestIndex, 1);
    }
  }

  const estimatedTime = totalDistance * 2; // Assume 2 min per km average
  return { route, totalDistance, estimatedTime };
}

/**
 * Batch compatible orders and calculate efficiency scores
 */
export function batchOrders(
  orders: Order[],
  partnerLocation: PartnerLocation,
  maxBatchSize: number = 3
): OrderBatch[] {
  const batches: OrderBatch[] = [];

  // Group orders by restaurant first
  const restaurantGroups = new Map<number, Order[]>();
  orders.forEach(order => {
    const restaurantId = order.restaurantId;
    if (!restaurantGroups.has(restaurantId)) {
      restaurantGroups.set(restaurantId, []);
    }
    restaurantGroups.get(restaurantId)!.push(order);
  });

  // Create batches from same restaurant
  restaurantGroups.forEach((restaurantOrders) => {
    for (let i = 0; i < restaurantOrders.length; i += maxBatchSize) {
      const batchOrders = restaurantOrders.slice(i, i + maxBatchSize);
      const { route, totalDistance, estimatedTime } = calculateOptimalRoute(
        partnerLocation,
        batchOrders
      );
      
      const totalEarnings = batchOrders.reduce(
        (sum, order) => sum + order.totalPrice * 0.15,
        0
      );

      // Efficiency score = earnings per minute
      const efficiencyScore = totalEarnings / Math.max(estimatedTime, 1);

      batches.push({
        orders: route,
        efficiencyScore,
        totalEarnings,
        estimatedTime,
        totalDistance,
        route: route.map(r => getDeliveryAddress(r)),
      });
    }
  });

  // Create cross-restaurant batches for nearby orders
  const remainingOrders = orders.filter(
    order => !batches.some(batch => batch.orders.some(o => o.id === order.id))
  );

  for (let i = 0; i < remainingOrders.length; i++) {
    const batchOrders: Order[] = [remainingOrders[i]];
    
    for (let j = i + 1; j < remainingOrders.length && batchOrders.length < maxBatchSize; j++) {
      if (areOrdersCompatible(batchOrders[0], remainingOrders[j])) {
        batchOrders.push(remainingOrders[j]);
      }
    }

    if (batchOrders.length > 1) {
      const { route, totalDistance, estimatedTime } = calculateOptimalRoute(
        partnerLocation,
        batchOrders
      );
      
      const totalEarnings = batchOrders.reduce(
        (sum, order) => sum + order.totalPrice * 0.15,
        0
      );

      const efficiencyScore = totalEarnings / Math.max(estimatedTime, 1);

      batches.push({
        orders: route,
        efficiencyScore,
        totalEarnings,
        estimatedTime,
        totalDistance,
        route: route.map(r => getDeliveryAddress(r)),
      });
    }
  }

  // Sort by efficiency score (highest first)
  return batches.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

