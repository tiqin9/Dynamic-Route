# 📡 API Reference - Complete Endpoint Documentation

**Base URL**: `http://localhost:5000`

---

## 🏠 Root Endpoints

### GET `/`
**Description**: Full API documentation and available endpoints  
**Response**: JSON with all endpoints listed  
**Example**:
```bash
curl http://localhost:5000/
```

### GET `/api/health`
**Description**: Health check with current status  
**Response**: 
```json
{
  "status": "OK",
  "timestamp": "2026-01-25T12:00:00.000Z",
  "ordersCount": 26,
  "routesCount": 5
}
```

---

## 📦 Orders Endpoints

### GET `/api/orders`
**Description**: Get all orders with summary statistics  
**Response**:
```json
{
  "count": 26,
  "orders": [
    {
      "id": "ORD-00001",
      "type": "HV",
      "volume": 2,
      "destination": {
        "name": "Tampa HV Stop 1",
        "latitude": 27.95,
        "longitude": -82.45,
        "city": "Tampa"
      },
      "pickupReturn": false,
      "vorStatus": "available",
      "shipDate": "2026-01-25T00:00:00.000Z",
      "priority": 4
    }
  ],
  "summary": {
    "byType": {
      "HV": 8,
      "HVB": 6,
      "VOR": 7,
      "MRB": 5
    }
  }
}
```

### POST `/api/orders`
**Description**: Create a new order  
**Request Body**:
```json
{
  "type": "HV",
  "volume": 2,
  "destination": {
    "name": "New Store",
    "latitude": 27.9506,
    "longitude": -82.4572,
    "address": "123 Main St",
    "city": "Tampa"
  },
  "pickupReturn": false,
  "vorStatus": "available",
  "priority": 3
}
```
**Response**:
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "ORD-ABC12345",
    "type": "HV",
    "volume": 2,
    ...
  }
}
```

### POST `/api/sample-data`
**Description**: Load 26 realistic sample orders  
**Request Body**: Empty (POST only)  
**Response**:
```json
{
  "message": "Loaded 26 sample orders",
  "orders": [...],
  "summary": {
    "hvCount": 8,
    "hvbCount": 6,
    "vorCount": 7,
    "mrbCount": 5
  }
}
```

---

## 🎯 Planning Endpoints

### POST `/api/plan`
**Description**: Generate optimized milk run plan  
**Request Body**:
```json
{
  "orderIds": [],
  "constraints": {
    "maxStopsPerRoute": 3,
    "trailerMaxPacks": 14,
    "flatbedMaxPacks": 8,
    "flatbedMaxHVPacks": 3,
    "vorMinDistance": 160,
    "maxRouteDuration": 1440,
    "vorEarliestTime": "2026-01-25T17:00:00Z",
    "departureTime": "2026-01-25T07:00:00Z",
    "planningDeadline": "2026-01-25T17:00:00Z"
  }
}
```
**Notes**: 
- Empty `orderIds` = use all loaded orders
- Null `constraints` = use defaults

**Response**:
```json
{
  "planId": "PLAN-ABC12345",
  "plan": {
    "routes": [
      {
        "id": "ROUTE-001",
        "name": "Milk Run 1 - HV",
        "stops": [...],
        "totalDistance": 45.2,
        "totalTime": 205,
        "totalVolume": 5,
        "departureTime": "2026-01-25T07:00:00Z",
        "estimatedArrivalTime": "2026-01-25T10:25:00Z"
      }
    ],
    "totalTrucksNeeded": 8,
    "totalDistance": 850.5,
    "totalOrders": 26
  },
  "summary": {
    "totalRoutes": 8,
    "totalOrders": 26,
    "totalDistance": "850.50",
    "estimatedTrucks": 8
  }
}
```

### GET `/api/plan/:id`
**Description**: Get specific plan details  
**Parameters**: 
- `id` (string): Plan ID from generation  

**Response**: Complete plan object with all routes and metrics

### GET `/api/constraints`
**Description**: Get current constraint settings  
**Response**:
```json
{
  "maxStopsPerRoute": 3,
  "trailerMaxPacks": 14,
  "flatbedMaxPacks": 8,
  "flatbedMaxHVPacks": 3,
  "vorMinDistance": 160,
  "maxRouteDuration": 1440,
  "vorEarliestTime": "2026-01-25T17:00:00Z",
  "departureTime": "2026-01-25T07:00:00Z",
  "planningDeadline": "2026-01-25T17:00:00Z"
}
```

---

## 🛣️ Route Endpoints

### POST `/api/routes`
**Description**: Create and optimize a new route  
**Request Body**:
```json
{
  "name": "Tampa Route A",
  "stops": [
    {
      "name": "Stop 1",
      "latitude": 27.9506,
      "longitude": -82.4572,
      "deliveryTime": 10,
      "quantity": 2
    },
    {
      "name": "Stop 2",
      "latitude": 27.9600,
      "longitude": -82.4600,
      "deliveryTime": 12,
      "quantity": 3
    }
  ]
}
```

**Response**:
```json
{
  "route": {
    "id": "ROUTE-XYZ789",
    "name": "Tampa Route A",
    "stops": [...],
    "totalDistance": 45.2,
    "totalTime": 205,
    "optimized": true
  },
  "metrics": {
    "totalDistance": 45.2,
    "totalTime": 205,
    "stopCount": 2,
    "averageStopDistance": 22.6,
    "volumeUtilization": 35.7,
    "efficiency": 6.4
  }
}
```

### GET `/api/routes`
**Description**: Get all created routes  
**Response**:
```json
{
  "count": 3,
  "routes": [
    {
      "id": "ROUTE-001",
      "name": "Tampa Route A",
      "stops": [...],
      "totalDistance": 45.2,
      "totalTime": 205,
      "createdAt": "2026-01-25T12:00:00Z"
    }
  ]
}
```

### GET `/api/routes/:id`
**Description**: Get specific route details  
**Parameters**:
- `id` (string): Route ID  

**Response**: Route object with full metrics

### GET `/api/routes/:id/manifest`
**Description**: Download route manifest as text file  
**Parameters**:
- `id` (string): Route ID  

**Response**: Text file with route details
```
============================================================
ROUTE MANIFEST - Tampa Route A
Route ID: ROUTE-001
Departure: 7:00:00 AM
Estimated Arrival: 10:25:00 AM
Total Distance: 45.20 km
Total Time: 205 minutes
============================================================

STOPS:
1. Stop 1
   Location: 27.9506, -82.4572
   - HV order: 2 packs (Value: $12,345.67)

2. Stop 2
   Location: 27.9600, -82.4600
   - HV order: 3 packs (Value: $18,234.56)
```

### POST `/api/routes/:id/optimize`
**Description**: Re-optimize an existing route  
**Parameters**:
- `id` (string): Route ID  

**Request Body**: Empty (POST only)  

**Response**: Updated route with optimized sequence

### DELETE `/api/routes/:id`
**Description**: Delete a route  
**Parameters**:
- `id` (string): Route ID  

**Response**:
```json
{
  "message": "Route deleted successfully"
}
```

---

## 📊 Metrics Endpoint

### POST `/api/calculate-metrics`
**Description**: Calculate metrics for a set of stops  
**Request Body**:
```json
{
  "stops": [
    {
      "name": "Stop 1",
      "latitude": 27.9506,
      "longitude": -82.4572,
      "deliveryTime": 10,
      "quantity": 2
    }
  ]
}
```

**Response**:
```json
{
  "totalDistance": 0,
  "totalTime": 10,
  "averageStopDistance": 0,
  "stopCount": 1,
  "volumeUtilization": 14.3,
  "efficiency": 0
}
```

---

## ❌ Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request. Required: name (string) and stops (array with at least 1 stop)"
}
```

### 404 Not Found
```json
{
  "error": "Route not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create route",
  "details": "Error message details"
}
```

---

## 📝 Order Type Reference

| Type | Truck | Capacity | Special Rules |
|------|-------|----------|---------------|
| **HV** | Flatbed | 8 total, max 3 HV | Valuable items |
| **HVB** | Trailer | 14 total | Battery + returns |
| **VOR** | Trailer | 14 total | >100 mi OR after 5 PM |
| **MRB** | Trailer | 14 total | Battery returns |

---

## 🔧 Constraint Reference

```
maxStopsPerRoute: 3           // Maximum stops per route
trailerMaxPacks: 14           // Trailer capacity
flatbedMaxPacks: 8            // Flatbed capacity
flatbedMaxHVPacks: 3          // Max HV items per flatbed
vorMinDistance: 160 (km)      // 100 miles for VOR constraint
maxRouteDuration: 1440 (min)  // 24 hours
vorEarliestTime: 5 PM         // VOR to far stops only after this
departureTime: 7 AM           // Standard route start
planningDeadline: 5 PM        // Order acceptance cutoff
```

---

## 🧪 Quick Test Commands

### Load Sample Data
```bash
curl -X POST http://localhost:5000/api/sample-data
```

### Get All Orders
```bash
curl http://localhost:5000/api/orders
```

### Generate Plan
```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": [],
    "constraints": null
  }'
```

### Get Plan Details
```bash
curl http://localhost:5000/api/plan/PLAN-ID
```

### Download Manifest
```bash
curl http://localhost:5000/api/routes/ROUTE-ID/manifest > manifest.txt
```

---

## 📊 Example Workflow

```bash
# 1. Start server
npm start

# 2. Load sample data
curl -X POST http://localhost:5000/api/sample-data > orders.json

# 3. Generate plan
PLAN=$(curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"orderIds":[], "constraints":null}' | jq -r '.planId')

# 4. Get plan details
curl http://localhost:5000/api/plan/$PLAN

# 5. Download first route manifest
ROUTE=$(curl http://localhost:5000/api/routes | \
  jq -r '.routes[0].id')

curl http://localhost:5000/api/routes/$ROUTE/manifest > manifest.txt
```

---

**Status**: ✅ All Endpoints Operational  
**Server**: http://localhost:5000  
**Last Updated**: January 2026
