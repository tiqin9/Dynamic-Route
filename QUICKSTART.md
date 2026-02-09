# 🎯 Quick Start Guide - Dynamic Milk Run Route Planner

## ✅ What's Already Running

Your server is currently running on **http://localhost:5000** with full functionality.

## 🚀 Access Points

### 1. **Basic Route Planner** (Simple UI)
- URL: http://localhost:5000/
- Features: Create simple routes, view on map, calculate metrics

### 2. **Advanced Dynamic Planner** (Full System)
- URL: http://localhost:5000/planner.html
- Features: Orders management, advanced constraints, multi-route planning, map visualization

### 3. **API Documentation**
- URL: http://localhost:5000/
- Lists all available endpoints and usage

---

## 📱 Using the Advanced Planner (Recommended)

### Step 1: Load Sample Orders
1. Open http://localhost:5000/planner.html
2. Click the **"Orders"** tab
3. Click **"📥 Load Sample Orders"** button
   - This loads 26 realistic orders across Florida locations
   - Includes all 4 order types (HV, HVB, VOR, MRB)

### Step 2: Review Orders
- See all loaded orders with type badges (color-coded)
- Each order shows volume and priority
- Orders include realistic locations:
  - **Tampa area**: HV deliveries (nearby)
  - **St. Petersburg**: HVB battery orders (nearby)
  - **Clearwater**: VOR supplies (nearby)
  - **Miami**: MRB returns (far, may need layover)
  - **Orlando**: VOR (far, triggers 5 PM constraint)

### Step 3: Configure Constraints
1. Click **"Route Planning"** tab
2. See order summary statistics
3. Adjust constraints if needed (or use defaults):
   - Max Stops per Route: **3**
   - Trailer Max Capacity: **14 packs**
   - Flatbed Max Capacity: **8 packs**
   - Flatbed Max HV Packs: **3**
   - Max Route Duration: **24 hours**

### Step 4: Generate Plan
1. Click **"🔧 Generate Optimized Plan"** button
2. Wait for optimization to complete (< 1 second)
3. See plan summary with:
   - Total routes generated
   - Trucks needed
   - Total distance
   - Orders assigned

### Step 5: View Results
1. Automatically switches to **"Results"** tab
2. See all routes with:
   - Route sequence
   - Distance and duration
   - Stops in order
   - Departure/arrival times
3. View **interactive map** showing all routes
   - Color-coded by route
   - Click markers for stop details
   - Polylines show route paths

---

## 🔧 API Usage Examples

### Load Sample Data
```bash
curl -X POST http://localhost:5000/api/sample-data
```
**Response**: 26 realistic orders across Florida

### Get All Orders
```bash
curl http://localhost:5000/api/orders
```
**Response**: List of orders with type/volume summaries

### Generate Route Plan
```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": [],
    "constraints": null
  }'
```
**Response**: Complete optimized route plan with metrics

### Get Plan Details
```bash
curl http://localhost:5000/api/plan/{planId}
```

### Download Route Manifest
```bash
curl http://localhost:5000/api/routes/{routeId}/manifest
```
**Response**: Text file with complete route details for driver

---

## 📊 Key Metrics Explained

### Per Route
- **Distance (km)**: Total kilometers including return to origin
- **Duration (min)**: Travel time + delivery times
- **Stops**: Number of delivery/pickup locations
- **Volume**: Total packs in route

### Plan Summary
- **Total Routes**: Number of vehicles needed
- **Trucks Needed**: Same as total routes
- **Total Distance**: Sum of all route distances
- **Orders Assigned**: How many orders fit in plan

---

## 🎨 Order Types & Colors

| Type | Color | Meaning | Truck | Constraint |
|------|-------|---------|-------|-----------|
| **HV** | 🔴 Red | High Value | Flatbed | Max 3 packs |
| **HVB** | 🟠 Orange | Battery + Return | Trailer | Flexible |
| **VOR** | 🔵 Cyan | Vehicle Off Road | Trailer | >100 mi OR after 5 PM |
| **MRB** | 🟢 Green | Return Battery | Trailer | Flexible |

---

## 💡 Important Constraints

### Why Some Orders Go to Different Routes

1. **Volume Limit**: If adding an order exceeds truck capacity
2. **Stop Limit**: Max 3 stops per route (creates new route for 4th)
3. **VOR Rule**: Far VOR (>100 mi) can only go with after-5 PM departure
4. **Flatbed HV**: Only 3 HV items per flatbed truck
5. **Route Time**: Total route >24 hours triggers split/layover

### Next-Day Layover

If a stop is >3 stops away or creates >24 hour duration:
- Route marked as `isLayover: true`
- Next-day delivery assigned
- Separate vehicle scheduled

---

## 🗺️ Understanding the Map

### Route Visualization
- **Colored circles**: Stops (numbered by sequence)
- **Route 1.1**: First stop of Route 1
- **Route 2.3**: Third stop of Route 2
- **Dashed lines**: Route paths connecting stops
- **Different colors**: Different routes

### Zooming & Panning
- **Scroll**: Zoom in/out
- **Drag**: Pan around map
- **Click markers**: See stop details (location, orders)

---

## ⚡ Example Scenario

### Input
- 26 orders (8 HV, 6 HVB, 4 VOR, 5 MRB, 3 far VOR)
- Default constraints

### Expected Output
- ~8-12 routes generated
- Routes optimized by geographic proximity
- All constraints validated
- Total distance: ~800-1200 km
- Total time: ~50-100 hours (sum of all routes)

### Route Example
```
Route 1: Tampa HV Route
├─ Stop 1: Tampa HV Stop 1 (27.95, -82.45)
├─ Stop 2: Tampa HV Stop 3 (27.96, -82.46)
└─ Stop 3: Tampa HV Stop 5 (27.94, -82.44)
Distance: 45.2 km | Duration: 205 min | Depart: 07:00 AM | Arrive: 10:25 AM
```

---

## 🆘 Troubleshooting

### "No routes created yet"
- Click "Load Sample Orders" first
- Or add custom orders manually

### Map not showing
- Ensure orders have valid latitude/longitude
- Plan should generate routes before map appears
- Check browser console for errors

### API returns 404
- Server may have stopped
- Restart: `npm start`
- Check http://localhost:5000/api/health

### Routes look suboptimal
- Check constraint settings
- Some suboptimality is expected with greedy + nearest neighbor
- Enable 2-opt optimization for best results

---

## 📝 File Reference

Key files you might want to explore:

| File | Purpose |
|------|---------|
| `src/server.ts` | Express API server |
| `src/milkRunOptimizer.ts` | Optimization algorithm |
| `src/mockServices.ts` | Sample data generator |
| `src/types.ts` | TypeScript interfaces |
| `public/planner.html` | Main UI application |

---

## ✨ Next Steps

1. **Explore the UI**: Load samples, experiment with constraints
2. **Review API**: Check each endpoint with curl/Postman
3. **Check Code**: Review `milkRunOptimizer.ts` for algorithm details
4. **Customize**: Modify sample data or constraints
5. **Extend**: Add real MFS/Service Center integrations

---

## 📞 Support

For issues or questions:
1. Check the **Documentation** tab in the app
2. Review `README_FULL.md` for detailed documentation
3. Examine source code comments
4. Check API response errors (detail messages included)

---

**Status**: ✅ System Ready  
**Server**: Running on http://localhost:5000  
**Last Updated**: January 2026
