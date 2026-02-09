import { Order, MFSData, ServiceCenterData } from './types';
/**
 * Mock MFS API for High-Value order data
 * In production, this would call a real MFS system
 */
declare class MockMFSAPI {
    /**
     * Get HV (High Value) order details
     */
    getHVOrderData(orderId: string): Promise<MFSData>;
    /**
     * Batch get HV data for multiple orders
     */
    getHVOrdersData(orderIds: string[]): Promise<Map<string, MFSData>>;
    /**
     * Update HV order status after pickup
     */
    updateOrderStatus(orderId: string, status: string): Promise<boolean>;
}
/**
 * Mock Service Center API for MRB (Material Return Battery) operations
 * Handles pickup and return scheduling
 */
declare class MockServiceCenterAPI {
    /**
     * Check available slots for battery returns
     */
    getAvailableSlots(date: Date, locationId: string): Promise<ServiceCenterData>;
    /**
     * Schedule battery return pickup
     */
    schedulePickup(orderId: string, pickupTime: Date): Promise<boolean>;
    /**
     * Get return battery inventory
     */
    getReturnInventory(): Promise<ServiceCenterData>;
    /**
     * Confirm return delivery
     */
    confirmReturn(orderId: string, timestamp: Date): Promise<boolean>;
}
/**
 * Sample mock order data generator
 */
export declare function generateMockOrders(count?: number): Order[];
/**
 * Enhanced sample data with realistic milk run scenarios
 */
export declare function generateRealisticMilkRuns(): Order[];
export { MockMFSAPI, MockServiceCenterAPI };
//# sourceMappingURL=mockServices.d.ts.map