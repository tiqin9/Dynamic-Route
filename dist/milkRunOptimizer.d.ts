import { Order, Route, Stop, Truck, RoutePlan, ConstraintSet, Location, RouteMetrics } from './types';
declare const TAMPA_ORIGIN: Location;
declare const DEFAULT_CONSTRAINTS: ConstraintSet;
/**
 * Calculate volume for an order based on type
 */
export declare function getOrderVolume(order: Order): number;
/**
 * Check if a truck can fit an order
 */
export declare function canTruckFitOrder(truck: Truck, order: Order): boolean;
/**
 * Check distance constraint for VOR orders
 */
export declare function isVORDistanceValid(origin: Location, destination: Location, constraints: ConstraintSet): boolean;
/**
 * Calculate route distance from origin
 */
export declare function calculateDistanceFromOrigin(origin: Location, stops: Stop[]): number;
/**
 * Group orders into milk runs respecting all constraints
 */
export declare function optimizeMilkRuns(orders: Order[], constraints?: ConstraintSet, origin?: Location): RoutePlan;
/**
 * Calculate metrics for a route
 */
export declare function calculateRouteMetrics(stops: Stop[]): RouteMetrics;
/**
 * Generate manifest for a route
 */
export declare function generateRouteManifest(route: Route): string;
export { DEFAULT_CONSTRAINTS, TAMPA_ORIGIN };
//# sourceMappingURL=milkRunOptimizer.d.ts.map