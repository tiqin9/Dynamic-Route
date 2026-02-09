"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineDistance = haversineDistance;
exports.calculateTotalDistance = calculateTotalDistance;
exports.calculateTotalTime = calculateTotalTime;
exports.optimizeRouteNearestNeighbor = optimizeRouteNearestNeighbor;
exports.optimizeRoute2Opt = optimizeRoute2Opt;
exports.optimizeRoute = optimizeRoute;
exports.calculateRouteMetrics = calculateRouteMetrics;
/**
 * Calculate the haversine distance between two coordinates
 * @param lat1 - latitude of first point
 * @param lon1 - longitude of first point
 * @param lat2 - latitude of second point
 * @param lon2 - longitude of second point
 * @returns distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Calculate total distance for a route
 */
function calculateTotalDistance(stops) {
    if (stops.length < 2)
        return 0;
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
        totalDistance += haversineDistance(stops[i].latitude, stops[i].longitude, stops[i + 1].latitude, stops[i + 1].longitude);
    }
    return totalDistance;
}
/**
 * Calculate total time for a route (distance + delivery times)
 * Assumes average speed of 40 km/h
 */
function calculateTotalTime(stops) {
    const averageSpeed = 40; // km/h
    const travelTime = (calculateTotalDistance(stops) / averageSpeed) * 60; // convert to minutes
    const deliveryTime = stops.reduce((sum, stop) => sum + (stop.deliveryTime || 5), 0);
    return travelTime + deliveryTime;
}
/**
 * Optimize route using nearest neighbor algorithm
 * This is a greedy algorithm that starts from the first stop and always goes to the nearest unvisited stop
 */
function optimizeRouteNearestNeighbor(stops) {
    if (stops.length <= 1)
        return stops;
    const remaining = [...stops.slice(1)]; // All stops except the first
    const optimized = [stops[0]]; // Start with first stop
    while (remaining.length > 0) {
        const lastStop = optimized[optimized.length - 1];
        let nearestIndex = 0;
        let minDistance = Infinity;
        // Find nearest unvisited stop
        for (let i = 0; i < remaining.length; i++) {
            const distance = haversineDistance(lastStop.latitude, lastStop.longitude, remaining[i].latitude, remaining[i].longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        optimized.push(remaining[nearestIndex]);
        remaining.splice(nearestIndex, 1);
    }
    return optimized;
}
/**
 * Optimize route using 2-opt algorithm (local search improvement)
 * This algorithm tries to improve the route by reversing segments
 */
function optimizeRoute2Opt(stops, iterations = 100) {
    let bestRoute = [...stops];
    let bestDistance = calculateTotalDistance(bestRoute);
    let improved = true;
    let iterationCount = 0;
    while (improved && iterationCount < iterations) {
        improved = false;
        iterationCount++;
        for (let i = 1; i < bestRoute.length - 1; i++) {
            for (let j = i + 1; j < bestRoute.length; j++) {
                // Create a new route by reversing the segment between i and j
                const newRoute = [
                    ...bestRoute.slice(0, i),
                    ...bestRoute.slice(i, j + 1).reverse(),
                    ...bestRoute.slice(j + 1)
                ];
                const newDistance = calculateTotalDistance(newRoute);
                if (newDistance < bestDistance) {
                    bestRoute = newRoute;
                    bestDistance = newDistance;
                    improved = true;
                }
            }
        }
    }
    return bestRoute;
}
/**
 * Full route optimization: nearest neighbor + 2-opt improvement
 */
function optimizeRoute(stops) {
    if (stops.length <= 2)
        return stops;
    // First pass: nearest neighbor
    let optimized = optimizeRouteNearestNeighbor(stops);
    // Second pass: 2-opt improvement
    optimized = optimizeRoute2Opt(optimized, 50);
    return optimized;
}
/**
 * Calculate metrics for a route
 */
function calculateRouteMetrics(stops) {
    const totalDistance = calculateTotalDistance(stops);
    const totalTime = calculateTotalTime(stops);
    return {
        totalDistance,
        totalTime,
        averageStopDistance: stops.length > 1 ? totalDistance / (stops.length - 1) : 0,
        stopCount: stops.length
    };
}
//# sourceMappingURL=routeOptimizer.js.map