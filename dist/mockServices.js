"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockServiceCenterAPI = exports.MockMFSAPI = void 0;
exports.generateMockOrders = generateMockOrders;
exports.generateRealisticMilkRuns = generateRealisticMilkRuns;
/**
 * Mock MFS API for High-Value order data
 * In production, this would call a real MFS system
 */
class MockMFSAPI {
    /**
     * Get HV (High Value) order details
     */
    async getHVOrderData(orderId) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            hvPackCount: Math.floor(Math.random() * 5) + 1,
            hvbPackCount: Math.floor(Math.random() * 3),
            estimatedValue: Math.random() * 50000 + 5000,
            requiresSignature: Math.random() > 0.3
        };
    }
    /**
     * Batch get HV data for multiple orders
     */
    async getHVOrdersData(orderIds) {
        const results = new Map();
        for (const orderId of orderIds) {
            results.set(orderId, await this.getHVOrderData(orderId));
        }
        return results;
    }
    /**
     * Update HV order status after pickup
     */
    async updateOrderStatus(orderId, status) {
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`[MFS] Updated order ${orderId} status to ${status}`);
        return true;
    }
}
exports.MockMFSAPI = MockMFSAPI;
/**
 * Mock Service Center API for MRB (Material Return Battery) operations
 * Handles pickup and return scheduling
 */
class MockServiceCenterAPI {
    /**
     * Check available slots for battery returns
     */
    async getAvailableSlots(date, locationId) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            mrbPickupCount: Math.floor(Math.random() * 20) + 5,
            estimatedReturnVolume: Math.floor(Math.random() * 100) + 50,
            availableSlots: Math.floor(Math.random() * 10) + 5
        };
    }
    /**
     * Schedule battery return pickup
     */
    async schedulePickup(orderId, pickupTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`[Service Center] Scheduled pickup for ${orderId} at ${pickupTime.toLocaleTimeString()}`);
        return true;
    }
    /**
     * Get return battery inventory
     */
    async getReturnInventory() {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
            mrbPickupCount: Math.floor(Math.random() * 50) + 20,
            estimatedReturnVolume: Math.floor(Math.random() * 200) + 100,
            availableSlots: Math.floor(Math.random() * 20) + 10
        };
    }
    /**
     * Confirm return delivery
     */
    async confirmReturn(orderId, timestamp) {
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`[Service Center] Confirmed return for ${orderId} at ${timestamp.toLocaleTimeString()}`);
        return true;
    }
}
exports.MockServiceCenterAPI = MockServiceCenterAPI;
/**
 * Sample mock order data generator
 */
function generateMockOrders(count = 50) {
    const cities = [
        { name: 'Tampa', lat: 27.9506, lon: -82.4572 },
        { name: 'St. Petersburg', lat: 27.7676, lon: -82.6403 },
        { name: 'Clearwater', lat: 27.9757, lon: -82.7597 },
        { name: 'Miami', lat: 25.7617, lon: -80.1918 },
        { name: 'Fort Lauderdale', lat: 26.1224, lon: -80.1373 },
        { name: 'Orlando', lat: 28.5421, lon: -81.3723 },
        { name: 'Jacksonville', lat: 30.3322, lon: -81.6557 }
    ];
    const types = ['HV', 'HVB', 'VOR', 'MRB'];
    const orders = [];
    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        // Add slight randomness to coordinates
        const lat = city.lat + (Math.random() - 0.5) * 0.05;
        const lon = city.lon + (Math.random() - 0.5) * 0.05;
        orders.push({
            id: `ORD-${String(i + 1).padStart(5, '0')}`,
            type,
            volume: Math.floor(Math.random() * 3) + 1,
            destination: {
                name: `${city.name} Stop ${i + 1}`,
                latitude: lat,
                longitude: lon,
                city: city.name,
                address: `${Math.floor(Math.random() * 9000) + 1000} Main St`
            },
            pickupReturn: type === 'MRB' ? Math.random() > 0.5 : false,
            vorStatus: type === 'VOR' ? 'vehicle_off_road' : 'available',
            shipDate: new Date(Date.now() + Math.random() * 86400000),
            priority: Math.floor(Math.random() * 5),
            weight: Math.random() * 100 + 10,
            fragile: Math.random() > 0.7
        });
    }
    return orders;
}
/**
 * Enhanced sample data with realistic milk run scenarios
 */
function generateRealisticMilkRuns() {
    const orders = [];
    let orderId = 1;
    // High-value items cluster (Tampa area)
    for (let i = 0; i < 8; i++) {
        orders.push({
            id: `ORD-${String(orderId++).padStart(5, '0')}`,
            type: 'HV',
            volume: Math.floor(Math.random() * 2) + 1,
            destination: {
                name: `Tampa HV Stop ${i + 1}`,
                latitude: 27.9506 + (Math.random() - 0.5) * 0.02,
                longitude: -82.4572 + (Math.random() - 0.5) * 0.02,
                city: 'Tampa'
            },
            pickupReturn: false,
            vorStatus: 'available',
            shipDate: new Date(),
            priority: 4,
            weight: Math.random() * 50 + 20,
            fragile: true
        });
    }
    // Battery deliveries with returns (St. Petersburg)
    for (let i = 0; i < 6; i++) {
        orders.push({
            id: `ORD-${String(orderId++).padStart(5, '0')}`,
            type: 'HVB',
            volume: 2,
            destination: {
                name: `St. Pete Battery Stop ${i + 1}`,
                latitude: 27.7676 + (Math.random() - 0.5) * 0.02,
                longitude: -82.6403 + (Math.random() - 0.5) * 0.02,
                city: 'St. Petersburg'
            },
            pickupReturn: true,
            vorStatus: 'available',
            shipDate: new Date(),
            priority: 3,
            weight: Math.random() * 80 + 40,
            fragile: false
        });
    }
    // Vehicle off-road supplies (Clearwater - nearby)
    for (let i = 0; i < 4; i++) {
        orders.push({
            id: `ORD-${String(orderId++).padStart(5, '0')}`,
            type: 'VOR',
            volume: 3,
            destination: {
                name: `Clearwater VOR Stop ${i + 1}`,
                latitude: 27.9757 + (Math.random() - 0.5) * 0.02,
                longitude: -82.7597 + (Math.random() - 0.5) * 0.02,
                city: 'Clearwater'
            },
            pickupReturn: false,
            vorStatus: 'vehicle_off_road',
            shipDate: new Date(),
            priority: 2,
            weight: Math.random() * 100 + 50,
            fragile: false
        });
    }
    // Material returns (Miami - far location)
    for (let i = 0; i < 5; i++) {
        orders.push({
            id: `ORD-${String(orderId++).padStart(5, '0')}`,
            type: 'MRB',
            volume: 2,
            destination: {
                name: `Miami MRB Stop ${i + 1}`,
                latitude: 25.7617 + (Math.random() - 0.5) * 0.05,
                longitude: -80.1918 + (Math.random() - 0.5) * 0.05,
                city: 'Miami'
            },
            pickupReturn: Math.random() > 0.4,
            vorStatus: 'available',
            shipDate: new Date(),
            priority: 1,
            weight: Math.random() * 60 + 30,
            fragile: false
        });
    }
    // Far-distance VOR (Orlando area - triggers 5 PM constraint)
    for (let i = 0; i < 3; i++) {
        orders.push({
            id: `ORD-${String(orderId++).padStart(5, '0')}`,
            type: 'VOR',
            volume: 2,
            destination: {
                name: `Orlando VOR Stop ${i + 1}`,
                latitude: 28.5421 + (Math.random() - 0.5) * 0.03,
                longitude: -81.3723 + (Math.random() - 0.5) * 0.03,
                city: 'Orlando'
            },
            pickupReturn: false,
            vorStatus: 'vehicle_off_road',
            shipDate: new Date(),
            priority: 2,
            weight: Math.random() * 100 + 50,
            fragile: false
        });
    }
    return orders;
}
//# sourceMappingURL=mockServices.js.map