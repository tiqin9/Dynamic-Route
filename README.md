# Milk Run Route Planner

A powerful route optimization system designed for milk runs and multi-stop delivery routes. This application uses advanced algorithms to optimize delivery sequences, minimizing distance and time.

## Features

- **Route Optimization**: Uses nearest neighbor + 2-opt algorithms for optimal route planning
- **Distance Calculation**: Haversine formula for accurate geographic distances
- **Time Estimation**: Includes travel time and delivery stop duration
- **Route Management**: Create, retrieve, update, and delete routes
- **Real-time Metrics**: Get detailed metrics including distance, time, and average stop distance
- **Web Interface**: Beautiful, responsive UI for easy route management
- **REST API**: Full-featured API for programmatic route management

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server (production)
npm start

# Or start in development mode with hot reload
npm run dev
```

The API will be available at `http://localhost:5000` and the web interface at `http://localhost:5000/public/index.html`

## Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:5000/public/index.html`
2. Enter a route name
3. Add delivery stops with:
   - Stop name
   - Latitude and longitude
   - Delivery time (in minutes)
   - Quantity (optional)
4. Click "Create & Optimize Route"
5. View the optimized route sequence and metrics

### API Endpoints

#### Create and Optimize Route
```bash
POST /api/routes
Content-Type: application/json

{
  "name": "Downtown Route",
  "stops": [
    {
      "name": "Store 1",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "deliveryTime": 5,
      "quantity": 10
    },
    {
      "name": "Store 2",
      "latitude": 40.7580,
      "longitude": -73.9855,
      "deliveryTime": 7,
      "quantity": 15
    }
  ]
}
```

#### Get All Routes
```bash
GET /api/routes
```

#### Get Specific Route
```bash
GET /api/routes/{routeId}
```

#### Re-optimize Route
```bash
POST /api/routes/{routeId}/optimize
```

#### Delete Route
```bash
DELETE /api/routes/{routeId}
```

#### Calculate Metrics
```bash
POST /api/calculate-metrics
Content-Type: application/json

{
  "stops": [
    {
      "name": "Store 1",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  ]
}
```

## Route Optimization Algorithm

The system uses a two-pass optimization approach:

1. **Nearest Neighbor Algorithm**: Starts from the first stop and iteratively selects the nearest unvisited stop. This provides a reasonable initial solution quickly.

2. **2-Opt Local Search**: Improves the initial route by reversing segments that reduce the total distance. This continues for a configurable number of iterations to escape local optima.

## Distance Calculation

Uses the Haversine formula for calculating great-circle distances between coordinates:
- Assumes Earth's radius: 6,371 km
- Accurate for most delivery scenarios
- Formula: `d = 2R * arcsin(√(sin²(Δlat/2) + cos(lat1)cos(lat2)sin²(Δlon/2)))`

## Time Estimation

Total time includes:
- **Travel Time**: Distance ÷ Average Speed (40 km/h) = Travel Time
- **Delivery Time**: Sum of delivery times at each stop
- Total Time = Travel Time + Delivery Time

## Example Response

```json
{
  "route": {
    "id": "uuid-string",
    "name": "Downtown Route",
    "stops": [
      {
        "id": "uuid-string",
        "name": "Store 1",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "deliveryTime": 5,
        "quantity": 10
      }
    ],
    "totalDistance": 12.45,
    "totalTime": 45.5,
    "createdAt": "2026-01-25T12:34:56.789Z",
    "optimized": true
  },
  "metrics": {
    "totalDistance": 12.45,
    "totalTime": 45.5,
    "averageStopDistance": 2.08,
    "stopCount": 6
  }
}
```

## Performance Considerations

- **Nearest Neighbor**: O(n²) time complexity, very fast for large datasets
- **2-Opt**: O(n²) per iteration with configurable iteration limit
- Maximum recommended: 1000+ stops per route
- Current implementation optimized for 50-100 stops

## Customization

### Adjust Average Speed
Edit `src/routeOptimizer.ts`, line ~80:
```typescript
const averageSpeed = 40; // km/h - change this value
```

### Change Optimization Iterations
Edit `src/server.ts`, line ~66:
```typescript
optimized = optimizeRoute2Opt(optimized, 50); // Change 50 to desired iterations
```

## License

ISC

## Support

For issues or feature requests, please create an issue in the repository.

## Future Enhancements

- [ ] Vehicle capacity constraints
- [ ] Time window constraints for deliveries
- [ ] Multiple vehicle routing
- [ ] Real traffic data integration
- [ ] Turn restrictions and one-way streets
- [ ] Export routes to GPS devices
- [ ] Advanced visualization with maps
