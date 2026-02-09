import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Route, RouteOptimizationRequest, Stop, Order, RoutePlan } from './types';
import { optimizeRoute, calculateTotalDistance, calculateTotalTime, calculateRouteMetrics } from './routeOptimizer';
import { optimizeMilkRuns, generateRouteManifest, TAMPA_ORIGIN, DEFAULT_CONSTRAINTS } from './milkRunOptimizer';
import { generateMockOrders, generateRealisticMilkRuns, MockMFSAPI, MockServiceCenterAPI } from './mockServices';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory storage
const routes: Map<string, Route> = new Map();
const routePlans: Map<string, RoutePlan> = new Map();
const orders: Map<string, Order> = new Map();

// Mock service instances
const mfsAPI = new MockMFSAPI();
const serviceCenterAPI = new MockServiceCenterAPI();

/**
 * GET / - Health check and API documentation
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Milk Run Route Planner API',
    version: '1.0.0',
    description: 'Dynamic multi-stop route optimization for logistics milk runs',
    endpoints: {
      'GET /api/health': 'Health check',
      'GET /api/orders': 'Get all orders',
      'POST /api/orders': 'Create new order',
      'POST /api/plan': 'Generate optimized milk run plan from orders',
      'GET /api/plan/:id': 'Get specific plan details',
      'POST /api/routes': 'Create and optimize a route',
      'GET /api/routes': 'Get all routes',
      'GET /api/routes/:id': 'Get specific route',
      'DELETE /api/routes/:id': 'Delete a route',
      'POST /api/routes/:id/optimize': 'Re-optimize route',
      'GET /api/routes/:id/manifest': 'Download route manifest',
      'POST /api/sample-data': 'Load sample orders',
      'GET /api/constraints': 'Get constraint settings'
    }
  });
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date(), ordersCount: orders.size, routesCount: routes.size });
});

/**
 * GET /api/constraints - Get current constraints
 */
app.get('/api/constraints', (req: Request, res: Response) => {
  res.json(DEFAULT_CONSTRAINTS);
});

/**
 * POST /api/sample-data - Load realistic sample orders
 */
app.post('/api/sample-data', (req: Request, res: Response) => {
  try {
    const mockOrders = generateRealisticMilkRuns();
    
    // Clear existing orders
    orders.clear();
    
    // Add mock orders to storage
    mockOrders.forEach(order => {
      orders.set(order.id, order);
    });

    res.status(201).json({
      message: `Loaded ${mockOrders.length} sample orders`,
      orders: mockOrders,
      summary: {
        hvCount: mockOrders.filter(o => o.type === 'HV').length,
        hvbCount: mockOrders.filter(o => o.type === 'HVB').length,
        vorCount: mockOrders.filter(o => o.type === 'VOR').length,
        mrbCount: mockOrders.filter(o => o.type === 'MRB').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load sample data', details: (error as Error).message });
  }
});

/**
 * GET /api/orders - Get all orders
 */
app.get('/api/orders', (req: Request, res: Response) => {
  const allOrders = Array.from(orders.values());
  res.json({
    count: allOrders.length,
    orders: allOrders,
    summary: {
      byType: {
        HV: allOrders.filter(o => o.type === 'HV').length,
        HVB: allOrders.filter(o => o.type === 'HVB').length,
        VOR: allOrders.filter(o => o.type === 'VOR').length,
        MRB: allOrders.filter(o => o.type === 'MRB').length
      }
    }
  });
});

/**
 * POST /api/orders - Create a new order
 */
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { type, volume, destination, pickupReturn, vorStatus, priority } = req.body;

    if (!type || !['HV', 'HVB', 'VOR', 'MRB'].includes(type)) {
      return res.status(400).json({ error: 'Invalid order type' });
    }

    if (!volume || typeof volume !== 'number' || volume <= 0) {
      return res.status(400).json({ error: 'Volume must be a positive number' });
    }

    if (!destination || typeof destination.latitude !== 'number' || typeof destination.longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid destination coordinates' });
    }

    const order: Order = {
      id: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
      type: type as 'HV' | 'HVB' | 'VOR' | 'MRB',
      volume,
      destination,
      pickupReturn: pickupReturn || false,
      vorStatus: vorStatus || 'available',
      shipDate: new Date(),
      priority: priority || 0
    };

    orders.set(order.id, order);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', details: (error as Error).message });
  }
});

/**
 * POST /api/plan - Generate optimized milk run plan
 */
app.post('/api/plan', (req: Request, res: Response) => {
  try {
    const { orderIds, constraints } = req.body;

    // Get orders to plan
    let ordersToPlан: Order[];
    
    if (orderIds && Array.isArray(orderIds)) {
      ordersToPlан = orderIds
        .map(id => orders.get(id))
        .filter((o): o is Order => o !== undefined);
    } else {
      ordersToPlан = Array.from(orders.values());
    }

    if (ordersToPlан.length === 0) {
      return res.status(400).json({ error: 'No orders found for planning' });
    }

    // Optimize milk runs
    const plan = optimizeMilkRuns(
      ordersToPlан,
      constraints || DEFAULT_CONSTRAINTS,
      TAMPA_ORIGIN
    );

    // Store the plan
    const planId = `PLAN-${uuidv4().substring(0, 8).toUpperCase()}`;
    routePlans.set(planId, { ...plan, routes: plan.routes.map(r => ({ ...r, id: uuidv4() })) });

    res.status(201).json({
      planId,
      plan: routePlans.get(planId),
      summary: {
        totalRoutes: plan.routes.length,
        totalOrders: plan.totalOrders,
        totalDistance: plan.totalDistance.toFixed(2),
        estimatedTrucks: plan.totalTrucksNeeded,
        constraints: plan.constraints
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate plan', details: (error as Error).message });
  }
});

/**
 * GET /api/plan/:id - Get plan details
 */
app.get('/api/plan/:id', (req: Request, res: Response) => {
  const plan = routePlans.get(req.params.id);
  
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  res.json(plan);
});

/**
 * POST /api/routes - Create and optimize a new route
 */
app.post('/api/routes', (req: Request, res: Response) => {
  try {
    const { name, stops }: RouteOptimizationRequest = req.body;

    if (!name || !stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request. Required: name (string) and stops (array with at least 1 stop)' 
      });
    }

    // Validate stops
    for (const stop of stops) {
      if (!stop.name || typeof stop.latitude !== 'number' || typeof stop.longitude !== 'number') {
        return res.status(400).json({
          error: 'Invalid stop format. Each stop requires: name, latitude, longitude'
        });
      }
    }

    // Assign IDs to stops if they don't have them
    const stopsWithIds: Stop[] = stops.map(stop => ({
      ...stop,
      id: stop.id || uuidv4(),
      deliveryTime: stop.deliveryTime || 5 // default 5 minutes
    }));

    // Optimize the route
    const optimizedStops = optimizeRoute(stopsWithIds);

    const route: Route = {
      id: uuidv4(),
      name,
      stops: optimizedStops,
      totalDistance: calculateTotalDistance(optimizedStops),
      totalTime: calculateTotalTime(optimizedStops),
      totalVolume: optimizedStops.reduce((sum, stop) => sum + (stop.quantity || 0), 0),
      createdAt: new Date(),
      departureTime: new Date(),
      estimatedArrivalTime: new Date(Date.now() + calculateTotalTime(optimizedStops) * 60000),
      optimized: true,
      trucks: []
    };

    routes.set(route.id, route);

    res.status(201).json({
      route,
      metrics: calculateRouteMetrics(optimizedStops)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create route', details: (error as Error).message });
  }
});

/**
 * GET /api/routes - Get all routes
 */
app.get('/api/routes', (req: Request, res: Response) => {
  const allRoutes = Array.from(routes.values());
  res.json({
    count: allRoutes.length,
    routes: allRoutes
  });
});

/**
 * GET /api/routes/:id - Get specific route
 */
app.get('/api/routes/:id', (req: Request, res: Response) => {
  const route = routes.get(req.params.id);
  
  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  res.json({
    route,
    metrics: calculateRouteMetrics(route.stops)
  });
});

/**
 * GET /api/routes/:id/manifest - Download route manifest
 */
app.get('/api/routes/:id/manifest', (req: Request, res: Response) => {
  const route = routes.get(req.params.id);
  
  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  const manifest = generateRouteManifest(route);
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="manifest-${route.id}.txt"`);
  res.send(manifest);
});

/**
 * DELETE /api/routes/:id - Delete a route
 */
app.delete('/api/routes/:id', (req: Request, res: Response) => {
  const deleted = routes.delete(req.params.id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Route not found' });
  }

  res.json({ message: 'Route deleted successfully' });
});

/**
 * POST /api/routes/:id/optimize - Re-optimize an existing route
 */
app.post('/api/routes/:id/optimize', (req: Request, res: Response) => {
  const route = routes.get(req.params.id);
  
  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  try {
    const optimizedStops = optimizeRoute(route.stops);
    
    const optimizedRoute: Route = {
      ...route,
      stops: optimizedStops,
      totalDistance: calculateTotalDistance(optimizedStops),
      totalTime: calculateTotalTime(optimizedStops)
    };

    routes.set(route.id, optimizedRoute);

    res.json({
      route: optimizedRoute,
      metrics: calculateRouteMetrics(optimizedStops)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize route', details: (error as Error).message });
  }
});

/**
 * POST /api/calculate-metrics - Calculate metrics for a route
 */
app.post('/api/calculate-metrics', (req: Request, res: Response) => {
  try {
    const { stops } = req.body;

    if (!stops || !Array.isArray(stops)) {
      return res.status(400).json({ error: 'Invalid request. Required: stops (array)' });
    }

    const metrics = calculateRouteMetrics(stops);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate metrics', details: (error as Error).message });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚚 Milk Run Route Planner API running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
  console.log(`\n📚 API Documentation:`);
  console.log(`   - GET http://localhost:${PORT}/ - Full API docs`);
  console.log(`   - POST http://localhost:${PORT}/api/sample-data - Load sample orders`);
  console.log(`   - POST http://localhost:${PORT}/api/plan - Generate milk run plan`);
});
