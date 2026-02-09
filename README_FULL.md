# 🚚 Dynamic Milk Run Route Planner

A comprehensive full-stack logistics optimization system for planning and executing multi-stop delivery routes ("milk runs") with advanced constraints, real-time optimization, and intelligent resource allocation.

## 📋 Project Overview

The Dynamic Milk Run Planner optimizes daily delivery routes for complex logistics operations involving multiple order types with specialized handling requirements:

- **HV (High Value)**: Standard high-value deliveries (flatbed, max 3 packs)
- **HVB (High Value Battery)**: Battery deliveries with return pickups
- **VOR (Vehicle Off Road)**: Specialized supplies for vehicles in remote locations (>100 miles, after 5 PM)
- **MRB (Material Return Battery)**: Return battery collection from service centers

## 🏗️ Architecture

### Backend (Node.js/Express)
```
src/
├── server.ts                    # Express API server with routing endpoints
├── types.ts                     # TypeScript interfaces for orders, routes, trucks, constraints
├── routeOptimizer.ts           # Core routing algorithms (nearest neighbor, 2-opt)
├── milkRunOptimizer.ts         # Advanced milk run optimization engine
├── mockServices.ts             # Mock MFS and Service Center APIs
```

### Frontend (HTML5/JavaScript)
```
public/
├── index.html                  # Basic route planner interface
├── planner.html               # Advanced Dynamic Milk Run Planner UI
```

## ✨ Key Features

### 1. **Orders Management**
- Support for 4 order types (HV, HVB, VOR, MRB) with distinct handling requirements
- Custom order creation with flexible parameters
- Sample realistic order dataset with proper geographic distribution
- Order priority and constraint validation

### 2. **Route Optimization Engine**
- **Greedy Algorithm**: Orders sorted by priority and type, assigned to routes respecting constraints
- **Nearest Neighbor Optimization**: Minimizes inter-stop distance
- **2-Opt Local Search**: Further refines route sequences
- **Constraint Validation**: Every route checked against:
  - Max 3 stops per route (with layover logic for >3)
  - Trailer capacity: 14 packs max
  - Flatbed capacity: 8 packs max (HV: max 3)
  - Route duration: < 24 hours
  - VOR: must be far stops (>100 miles) OR after 5 PM
  - Departure: 7 AM (next-day for late orders)

### 3. **Advanced Constraints**
```typescript
- maxStopsPerRoute: 3         // Split to multiple routes/layover if needed
- trailerMaxPacks: 14         // Standard 53-ft trailer capacity
- flatbedMaxPacks: 8          // Flatbed truck capacity
- flatbedMaxHVPacks: 3        // HV items per flatbed
- vorMinDistance: 160 km      // 100 miles for VOR constraint
- maxRouteDuration: 1440 min  // 24 hours
- vorEarliestTime: 5 PM       // VOR to far stops only after this time
- departureTime: 7 AM         // Route start time
- planningDeadline: 5 PM      // Orders received by this time
```

### 4. **Visualization & Reporting**
- Interactive Leaflet maps with color-coded routes
- Real-time route sequencing with stop markers
- Distance and time metrics per route
- Route manifests with pickup/delivery details
- Export capabilities for driver documentation

### 5. **Service Integrations**
- Mock MFS API for high-value order verification
- Mock Service Center API for battery return scheduling
- Order status tracking and delivery confirmation
- Return batch management

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Build
```bash
npm run build
# or with watch mode:
npm run build:watch
```

### Start Server
```bash
npm start
# Server runs on http://localhost:5000
```

### Access the Application
- **Basic Planner**: http://localhost:5000/
- **Advanced Dynamic Planner**: http://localhost:5000/planner.html
- **API Documentation**: http://localhost:5000/

## 📊 API Endpoints

### Orders
- `GET /api/orders` - Get all orders with summary
- `POST /api/orders` - Create new order
- `POST /api/sample-data` - Load realistic sample dataset

### Planning
- `POST /api/plan` - Generate optimized milk run plan
- `GET /api/plan/:id` - Get specific plan details

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route details
- `GET /api/routes/:id/manifest` - Download route manifest
- `DELETE /api/routes/:id` - Delete route
- `POST /api/routes/:id/optimize` - Re-optimize route

### System
- `GET /api/health` - Health check
- `GET /api/constraints` - Get current constraint settings
- `POST /api/calculate-metrics` - Calculate route metrics

## 💡 Usage Workflow

### 1. Load Orders
```javascript
// Load realistic sample data
POST /api/sample-data

// Or create custom orders
POST /api/orders {
  "type": "HV",
  "volume": 2,
  "destination": { "name": "Store 1", "latitude": 27.9506, "longitude": -82.4572 },
  "priority": 4
}
```

### 2. Configure Constraints
```javascript
{
  "maxStopsPerRoute": 3,
  "trailerMaxPacks": 14,
  "flatbedMaxPacks": 8,
  "flatbedMaxHVPacks": 3,
  "maxRouteDuration": 1440
}
```

### 3. Generate Plan
```javascript
POST /api/plan {
  "orderIds": ["ORD-00001", "ORD-00002", ...],
  "constraints": { /* as above */ }
}
```

### 4. Analyze Results
- View optimized route sequences
- Check distance/time metrics
- Visualize routes on map
- Download manifests for drivers

## 🔧 Algorithm Details

### Order Sorting & Priority
```
Priority order:
1. By user-specified priority (descending)
2. By type: HVB > HV > VOR > MRB
3. By earliest ship date
```

### Route Assignment (Greedy)
For each order (in priority order):
1. Try to fit into existing route
2. Check all constraints (volume, stops, distance, time, VOR)
3. If no fit, create new route
4. Track violations for reporting

### Optimization (Nearest Neighbor)
```
Starting at origin (Tampa DC):
1. Find nearest unvisited stop
2. Add to route sequence
3. Repeat until all stops assigned
4. Return to origin
```

### Metrics Calculation
- **Distance**: Haversine distance between all stops + return
- **Time**: Travel time (40 km/h avg) + delivery times (5-15 min per stop)
- **Volume Utilization**: Current load / max capacity
- **Efficiency**: Distance per pack delivered

## 📦 Sample Data

Realistic dataset includes:
- **Tampa area (8 HV orders)**: High-value deliveries, nearby
- **St. Petersburg (6 HVB orders)**: Battery deliveries with returns
- **Clearwater (4 VOR orders)**: Vehicle off-road supplies, nearby  
- **Miami (5 MRB orders)**: Battery returns, far location (layover may apply)
- **Orlando (3 VOR orders)**: Far VOR deliveries (>100 miles, triggers 5 PM)

## 🧪 Example Usage

### Load sample data and generate plan:
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Load sample data
curl -X POST http://localhost:5000/api/sample-data

# Get the response with loaded orders
# Then generate plan with custom or default constraints
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": [],  // Empty = use all
    "constraints": null  // null = use defaults
  }'
```

## 📈 Performance

- **Orders**: Handles 50+ orders efficiently
- **Routes**: Generates 5-15 routes per planning cycle
- **Processing**: < 1s for typical scenario
- **Optimization**: Iterative 2-opt improvements
- **Scalability**: Easily extends to 100+ orders with batching

## 🔐 Constraints Enforcement

All constraints are validated and enforced:
- ✅ Volume capacity checks (per truck type)
- ✅ Stop count limits (max 3, split if needed)
- ✅ Route duration limits (< 24 hours)
- ✅ Geographic constraints (VOR >100 miles after 5 PM)
- ✅ Truck type matching (HV → flatbed, others → trailer)
- ✅ Violation reporting in route data

## 🎯 Future Enhancements

- [ ] Real maps API integration (Google Maps for actual routing)
- [ ] Driver app with real-time tracking
- [ ] Dynamic re-routing based on traffic/delays
- [ ] Machine learning for demand forecasting
- [ ] Vehicle telematics integration
- [ ] Customer notification system
- [ ] Cost optimization (fuel, time, vehicle hours)
- [ ] Weather impact routing
- [ ] Multi-depot planning
- [ ] Load balancing across drivers
- [ ] Proof of delivery (POD) integration
- [ ] Analytics dashboard with KPIs

## 📖 Technologies

- **Frontend**: HTML5, JavaScript, Leaflet.js (mapping)
- **Backend**: Node.js, Express.js, TypeScript
- **Algorithms**: Greedy assignment, nearest neighbor, 2-opt
- **Math**: Haversine distance, route optimization
- **APIs**: RESTful with JSON

## 📝 License

ISC

## 👨‍💼 Author

Developed for logistics optimization and milk run route planning.

---

**Status**: ✅ Fully Functional  
**Last Updated**: January 2026
