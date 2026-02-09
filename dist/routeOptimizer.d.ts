import { Stop, RouteMetrics } from './types';
/**
 * Calculate the haversine distance between two coordinates
 * @param lat1 - latitude of first point
 * @param lon1 - longitude of first point
 * @param lat2 - latitude of second point
 * @param lon2 - longitude of second point
 * @returns distance in kilometers
 */
export declare function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
/**
 * Calculate total distance for a route
 */
export declare function calculateTotalDistance(stops: Stop[]): number;
/**
 * Calculate total time for a route (distance + delivery times)
 * Assumes average speed of 40 km/h
 */
export declare function calculateTotalTime(stops: Stop[]): number;
/**
 * Optimize route using nearest neighbor algorithm
 * This is a greedy algorithm that starts from the first stop and always goes to the nearest unvisited stop
 */
export declare function optimizeRouteNearestNeighbor(stops: Stop[]): Stop[];
/**
 * Optimize route using 2-opt algorithm (local search improvement)
 * This algorithm tries to improve the route by reversing segments
 */
export declare function optimizeRoute2Opt(stops: Stop[], iterations?: number): Stop[];
/**
 * Full route optimization: nearest neighbor + 2-opt improvement
 */
export declare function optimizeRoute(stops: Stop[]): Stop[];
/**
 * Calculate metrics for a route
 */
export declare function calculateRouteMetrics(stops: Stop[]): RouteMetrics;
//# sourceMappingURL=routeOptimizer.d.ts.map