"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAMPA_ORIGIN = exports.DEFAULT_CONSTRAINTS = void 0;
exports.getOrderVolume = getOrderVolume;
exports.canTruckFitOrder = canTruckFitOrder;
exports.isVORDistanceValid = isVORDistanceValid;
exports.calculateDistanceFromOrigin = calculateDistanceFromOrigin;
exports.optimizeMilkRuns = optimizeMilkRuns;
exports.calculateRouteMetrics = calculateRouteMetrics;
exports.generateRouteManifest = generateRouteManifest;
const routeOptimizer_1 = require("./routeOptimizer");
const TAMPA_ORIGIN = {
    name: 'Tampa Distribution Center',
    latitude: 27.9506,
    longitude: -82.4572,
    city: 'Tampa',
    zipCode: 'FL'
};
exports.TAMPA_ORIGIN = TAMPA_ORIGIN;
const DEFAULT_CONSTRAINTS = {
    maxStopsPerRoute: 3,
    trailerMaxPacks: 14,
    flatbedMaxPacks: 8,
    flatbedMaxHVPacks: 3,
    vorMinDistance: 160, // 100 miles
    maxRouteDuration: 1440, // 24 hours
    vorEarliestTime: new Date(new Date().setHours(17, 0, 0)), // 5 PM
    departureTime: new Date(new Date().setHours(7, 0, 0)), // 7 AM
    planningDeadline: new Date(new Date().setHours(17, 0, 0)) // 5 PM
};
exports.DEFAULT_CONSTRAINTS = DEFAULT_CONSTRAINTS;
/**
 * Calculate volume for an order based on type
 */
function getOrderVolume(order) {
    const baseVolume = order.volume || 1;
    switch (order.type) {
        case 'HV':
            return baseVolume;
        case 'HVB':
            return baseVolume * 1.2; // HVB takes slightly more space
        case 'VOR':
            return baseVolume;
        case 'MRB':
            return order.pickupReturn ? baseVolume * 1.5 : baseVolume; // Return volume is larger
        default:
            return baseVolume;
    }
}
/**
 * Check if a truck can fit an order
 */
function canTruckFitOrder(truck, order) {
    const orderVolume = getOrderVolume(order);
    const remainingCapacity = truck.maxCapacity - truck.currentLoad;
    if (remainingCapacity < orderVolume) {
        return false;
    }
    // Flatbed constraints
    if (truck.type === 'flatbed') {
        const hvCount = truck.assignedOrders.filter(o => o.type === 'HV').length;
        if (order.type === 'HV' && hvCount >= (truck.constraints?.maxHVPacks || 3)) {
            return false;
        }
    }
    return true;
}
/**
 * Check distance constraint for VOR orders
 */
function isVORDistanceValid(origin, destination, constraints) {
    const distanceKm = (0, routeOptimizer_1.haversineDistance)(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
    const distanceMiles = distanceKm * 0.621371;
    return distanceMiles <= constraints.vorMinDistance;
}
/**
 * Calculate route distance from origin
 */
function calculateDistanceFromOrigin(origin, stops) {
    if (stops.length === 0)
        return 0;
    let totalDistance = (0, routeOptimizer_1.haversineDistance)(origin.latitude, origin.longitude, stops[0].latitude, stops[0].longitude);
    totalDistance += (0, routeOptimizer_1.calculateTotalDistance)(stops);
    // Return to origin
    const lastStop = stops[stops.length - 1];
    totalDistance += (0, routeOptimizer_1.haversineDistance)(lastStop.latitude, lastStop.longitude, origin.latitude, origin.longitude);
    return totalDistance;
}
/**
 * Group orders into milk runs respecting all constraints
 */
function optimizeMilkRuns(orders, constraints = DEFAULT_CONSTRAINTS, origin = TAMPA_ORIGIN) {
    // Sort orders by priority and type
    const sortedOrders = [...orders].sort((a, b) => {
        const priorityDiff = (b.priority || 0) - (a.priority || 0);
        if (priorityDiff !== 0)
            return priorityDiff;
        // HVB and HV first (valuable), then VOR, then MRB
        const typeOrder = { 'HVB': 4, 'HV': 3, 'VOR': 2, 'MRB': 1 };
        return (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0);
    });
    const routes = [];
    const unassignedOrders = [];
    let routeIndex = 0;
    // Group orders into routes
    for (const order of sortedOrders) {
        let assigned = false;
        // Try to fit into existing route
        for (const route of routes) {
            if (canAddOrderToRoute(route, order, constraints, origin)) {
                route.stops = addOrderToRoute(route.stops, order);
                route.totalVolume += getOrderVolume(order);
                assigned = true;
                break;
            }
        }
        // Create new route if not assigned
        if (!assigned) {
            const newRoute = createNewRoute(order, origin, routeIndex++);
            routes.push(newRoute);
        }
    }
    // Optimize each route
    const optimizedRoutes = routes.map(route => optimizeRouteSequence(route, origin));
    return {
        routes: optimizedRoutes,
        totalTrucksNeeded: optimizedRoutes.length,
        totalDistance: optimizedRoutes.reduce((sum, r) => sum + r.totalDistance, 0),
        totalOrders: orders.length,
        planDate: new Date(),
        origin,
        constraints
    };
}
/**
 * Check if an order can be added to a route
 */
function canAddOrderToRoute(route, order, constraints, origin) {
    // Check stop count
    if (route.stops.length >= constraints.maxStopsPerRoute) {
        return false;
    }
    // Check volume capacity
    const truck = route.trucks[0];
    if (!canTruckFitOrder(truck, order)) {
        return false;
    }
    // Check VOR constraints
    if (order.type === 'VOR' && !isVORDistanceValid(origin, order.destination, constraints)) {
        return false;
    }
    // Check time constraints
    const projectedDistance = calculateDistanceFromOrigin(origin, [...route.stops, { id: order.id, ...order.destination, orders: [order] }]);
    const avgSpeed = 40; // km/h
    const projectedTime = (projectedDistance / avgSpeed) * 60;
    if (projectedTime > constraints.maxRouteDuration) {
        return false;
    }
    return true;
}
/**
 * Add order to route stops
 */
function addOrderToRoute(stops, order) {
    const existingStop = stops.find(s => s.latitude === order.destination.latitude &&
        s.longitude === order.destination.longitude);
    if (existingStop) {
        if (!existingStop.orders)
            existingStop.orders = [];
        existingStop.orders.push(order);
        existingStop.quantity = (existingStop.quantity || 0) + getOrderVolume(order);
        return stops;
    }
    const newStop = {
        id: order.id,
        ...order.destination,
        orders: [order],
        quantity: getOrderVolume(order),
        deliveryTime: 10 + (Math.random() * 5) // 10-15 minutes
    };
    return [...stops, newStop];
}
/**
 * Create a new route for an order
 */
function createNewRoute(order, origin, index) {
    const truck = {
        id: `TRUCK-${index}-${order.type}`,
        type: order.type === 'HV' ? 'flatbed' : 'trailer',
        maxCapacity: order.type === 'HV' ? 8 : 14,
        currentLoad: getOrderVolume(order),
        assignedOrders: [order]
    };
    const stop = {
        id: order.id,
        ...order.destination,
        orders: [order],
        quantity: getOrderVolume(order),
        deliveryTime: 10
    };
    return {
        id: `ROUTE-${Date.now()}-${index}`,
        name: `Milk Run ${index + 1} - ${order.type}`,
        stops: [stop],
        trucks: [truck],
        totalDistance: 0,
        totalTime: 0,
        totalVolume: getOrderVolume(order),
        createdAt: new Date(),
        departureTime: new Date(),
        estimatedArrivalTime: new Date(),
        optimized: false,
        violations: []
    };
}
/**
 * Optimize the sequence of stops in a route
 */
function optimizeRouteSequence(route, origin) {
    if (route.stops.length <= 1) {
        return updateRouteMetrics(route, origin);
    }
    // Use nearest neighbor from origin
    const optimizedStops = nearestNeighbor([origin, ...route.stops]);
    // Remove origin from result
    route.stops = optimizedStops.slice(1);
    return updateRouteMetrics(route, origin);
}
/**
 * Nearest neighbor algorithm
 */
function nearestNeighbor(locations) {
    if (locations.length <= 2)
        return locations;
    const [origin, ...remaining] = locations;
    const result = [origin];
    while (remaining.length > 0) {
        const lastLocation = result[result.length - 1];
        let nearestIndex = 0;
        let minDistance = Infinity;
        for (let i = 0; i < remaining.length; i++) {
            const distance = (0, routeOptimizer_1.haversineDistance)(lastLocation.latitude, lastLocation.longitude, remaining[i].latitude, remaining[i].longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        result.push(remaining[nearestIndex]);
        remaining.splice(nearestIndex, 1);
    }
    return result;
}
/**
 * Update route metrics (distance, time, etc.)
 */
function updateRouteMetrics(route, origin) {
    const stops = route.stops;
    // Calculate total distance including return to origin
    let totalDistance = (0, routeOptimizer_1.haversineDistance)(origin.latitude, origin.longitude, stops[0].latitude, stops[0].longitude);
    for (let i = 0; i < stops.length - 1; i++) {
        totalDistance += (0, routeOptimizer_1.haversineDistance)(stops[i].latitude, stops[i].longitude, stops[i + 1].latitude, stops[i + 1].longitude);
    }
    // Return to origin
    if (stops.length > 0) {
        const lastStop = stops[stops.length - 1];
        totalDistance += (0, routeOptimizer_1.haversineDistance)(lastStop.latitude, lastStop.longitude, origin.latitude, origin.longitude);
    }
    // Calculate total time (distance + delivery times)
    const avgSpeed = 40; // km/h
    const travelTime = (totalDistance / avgSpeed) * 60; // minutes
    const deliveryTime = stops.reduce((sum, stop) => sum + (stop.deliveryTime || 10), 0);
    const totalTime = travelTime + deliveryTime;
    // Update departure and arrival times
    const departureTime = new Date();
    departureTime.setHours(7, 0, 0); // 7 AM
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + totalTime);
    return {
        ...route,
        totalDistance,
        totalTime,
        departureTime,
        estimatedArrivalTime: arrivalTime,
        optimized: true
    };
}
/**
 * Calculate metrics for a route
 */
function calculateRouteMetrics(stops) {
    const totalDistance = (0, routeOptimizer_1.calculateTotalDistance)(stops);
    const totalTime = (0, routeOptimizer_1.calculateTotalTime)(stops);
    const totalVolume = stops.reduce((sum, stop) => sum + (stop.quantity || 0), 0) || 1;
    return {
        totalDistance,
        totalTime,
        averageStopDistance: stops.length > 1 ? totalDistance / (stops.length - 1) : 0,
        stopCount: stops.length,
        volumeUtilization: (totalVolume / 14) * 100, // assuming 14 is max
        efficiency: totalDistance / Math.max(totalVolume, 1)
    };
}
/**
 * Generate manifest for a route
 */
function generateRouteManifest(route) {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push(`ROUTE MANIFEST - ${route.name}`);
    lines.push(`Route ID: ${route.id}`);
    lines.push(`Departure: ${route.departureTime.toLocaleTimeString()}`);
    lines.push(`Estimated Arrival: ${route.estimatedArrivalTime.toLocaleTimeString()}`);
    lines.push(`Total Distance: ${route.totalDistance.toFixed(2)} km`);
    lines.push(`Total Time: ${Math.round(route.totalTime)} minutes`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push('STOPS:');
    route.stops.forEach((stop, index) => {
        lines.push(`${index + 1}. ${stop.name}`);
        lines.push(`   Location: ${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}`);
        if (stop.address)
            lines.push(`   Address: ${stop.address}`);
        if (stop.orders) {
            stop.orders.forEach(order => {
                lines.push(`   - ${order.type} order: ${order.volume} packs (Value: $${(Math.random() * 10000).toFixed(2)})`);
            });
        }
        lines.push('');
    });
    return lines.join('\n');
}
//# sourceMappingURL=milkRunOptimizer.js.map