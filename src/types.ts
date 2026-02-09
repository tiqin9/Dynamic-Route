// Order Types
export type OrderType = 'HV' | 'HVB' | 'VOR' | 'MRB';
export type VORStatus = 'vehicle_off_road' | 'available' | 'maintenance';

export interface Order {
  id: string;
  type: OrderType;
  volume: number; // numeric volume (in packs)
  destination: Location;
  pickupReturn: boolean; // for MRB orders
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
  deliveryTime?: number; // minutes
  quantity?: number; // units to deliver
  orders?: Order[];
  departureTime?: Date;
  arrivalTime?: Date;
  deliveryComplete?: boolean;
}

export interface Truck {
  id: string;
  type: 'trailer' | 'flatbed';
  maxCapacity: number; // max packs
  currentLoad: number; // current packs
  assignedOrders: Order[];
  constraints?: TruckConstraints;
}

export interface TruckConstraints {
  maxHVPacks?: number; // max 3 HV packs for flatbed
  maxStops?: number; // max 3 stops typically
  maxDistance?: number; // max km
  maxDuration?: number; // max minutes in route
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  trucks: Truck[];
  totalDistance: number; // kilometers
  totalTime: number; // minutes
  totalVolume: number; // total packs
  createdAt: Date;
  departureTime: Date;
  estimatedArrivalTime: Date;
  optimized?: boolean;
  isLayover?: boolean; // next-day delivery
  violations?: string[]; // constraint violations
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
  vorMinDistance: number; // miles to trigger VOR after 5 PM
  maxRouteDuration: number; // minutes
  vorEarliestTime: Date; // 5 PM
  departureTime: Date; // 7 AM
  planningDeadline: Date; // 5 PM for next-day
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
  volumeUtilization?: number; // %
  efficiency?: number; // km per pack
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
