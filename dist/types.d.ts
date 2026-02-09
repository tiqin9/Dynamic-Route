export type OrderType = 'HV' | 'HVB' | 'VOR' | 'MRB';
export type VORStatus = 'vehicle_off_road' | 'available' | 'maintenance';
export interface Order {
    id: string;
    type: OrderType;
    volume: number;
    destination: Location;
    pickupReturn: boolean;
    vorStatus?: VORStatus;
    shipDate: Date;
    priority?: number;
    weight?: number;
    fragile?: boolean;
}
export interface Location {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    zipCode?: string;
}
export interface Stop extends Location {
    id: string;
    deliveryTime?: number;
    quantity?: number;
    orders?: Order[];
    departureTime?: Date;
    arrivalTime?: Date;
    deliveryComplete?: boolean;
}
export interface Truck {
    id: string;
    type: 'trailer' | 'flatbed';
    maxCapacity: number;
    currentLoad: number;
    assignedOrders: Order[];
    constraints?: TruckConstraints;
}
export interface TruckConstraints {
    maxHVPacks?: number;
    maxStops?: number;
    maxDistance?: number;
    maxDuration?: number;
}
export interface Route {
    id: string;
    name: string;
    stops: Stop[];
    trucks: Truck[];
    totalDistance: number;
    totalTime: number;
    totalVolume: number;
    createdAt: Date;
    departureTime: Date;
    estimatedArrivalTime: Date;
    optimized?: boolean;
    isLayover?: boolean;
    violations?: string[];
}
export interface RoutePlan {
    routes: Route[];
    totalTrucksNeeded: number;
    totalDistance: number;
    totalOrders: number;
    planDate: Date;
    origin: Location;
    constraints: ConstraintSet;
}
export interface ConstraintSet {
    maxStopsPerRoute: number;
    trailerMaxPacks: number;
    flatbedMaxPacks: number;
    flatbedMaxHVPacks: number;
    vorMinDistance: number;
    maxRouteDuration: number;
    vorEarliestTime: Date;
    departureTime: Date;
    planningDeadline: Date;
}
export interface RouteOptimizationRequest {
    name: string;
    stops: Stop[];
    orders?: Order[];
}
export interface RouteMetrics {
    totalDistance: number;
    totalTime: number;
    averageStopDistance: number;
    stopCount: number;
    volumeUtilization?: number;
    efficiency?: number;
}
export interface MFSData {
    hvPackCount: number;
    hvbPackCount: number;
    estimatedValue: number;
    requiresSignature: boolean;
}
export interface ServiceCenterData {
    mrbPickupCount: number;
    estimatedReturnVolume: number;
    availableSlots: number;
}
//# sourceMappingURL=types.d.ts.map