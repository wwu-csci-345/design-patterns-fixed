// The system supports several ways of traveling from point A
// to point B:
//
// 1. Driving
// 2. Walking
// 3. Cycling
// 4. Public transit
//
// Each routing algorithm is placed in its own strategy class.
// MapNavigator no longer contains or selects all algorithms.
//
// The client chooses a strategy and gives it to MapNavigator.
// ------------------------------------------------------------

// Represents a geographic point used by this application.
type MapPoint = {
  name: string;
  latitude: number;
  longitude: number;
};

// Represents the result produced by a routing strategy.
type RouteResult = {
  description: string;
  distanceKm: number;
  estimatedMinutes: number;
};

// ------------------------------------------------------------
// Strategy interface
// ------------------------------------------------------------
//
// This interface defines the common operation that every route
// calculation strategy must provide.
//
// MapNavigator depends on this abstraction rather than depending
// directly on DrivingRouteStrategy, WalkingRouteStrategy, or any
// other concrete strategy.
//
// Because all strategies implement the same interface, they can
// be substituted for one another.
// ------------------------------------------------------------

interface RouteStrategy {
  calculateRoute(start: MapPoint, destination: MapPoint): RouteResult;
}

// ------------------------------------------------------------
// Concrete strategy: driving
// ------------------------------------------------------------
//
// This class contains only the algorithm and rules needed for
// calculating a driving route.
//
// Driving routes may prioritize:
//
// - major roads
// - lower travel time
// - current traffic
// - road closures
// ------------------------------------------------------------

class DrivingRouteStrategy implements RouteStrategy {
  calculateRoute(start: MapPoint, destination: MapPoint): RouteResult {
    console.log('Loading the road network...');
    console.log('Checking current traffic...');
    console.log('Avoiding closed roads...');
    console.log('Selecting the fastest driving path...');

    return {
      description:
        `Drive from ${start.name} to ${destination.name} ` +
        'using major roads while avoiding heavy traffic.',
      distanceKm: 24,
      estimatedMinutes: 32,
    };
  }
}

// ------------------------------------------------------------
// Concrete strategy: walking
// ------------------------------------------------------------
//
// This class contains only the algorithm and rules needed for
// calculating a walking route.
//
// Walking routes may prioritize:
//
// - sidewalks
// - pedestrian paths
// - crosswalks
// - roads that permit pedestrian access
// ------------------------------------------------------------

class WalkingRouteStrategy implements RouteStrategy {
  calculateRoute(start: MapPoint, destination: MapPoint): RouteResult {
    console.log('Loading pedestrian map data...');
    console.log('Finding sidewalks and walking paths...');
    console.log('Avoiding roads without pedestrian access...');
    console.log('Selecting a safe walking path...');

    return {
      description:
        `Walk from ${start.name} to ${destination.name} ` +
        'using sidewalks, crosswalks, and pedestrian paths.',
      distanceKm: 18,
      estimatedMinutes: 220,
    };
  }
}

// ------------------------------------------------------------
// Concrete strategy: cycling
// ------------------------------------------------------------
//
// This class contains only the algorithm and rules needed for
// calculating a cycling route.
//
// Cycling routes may prioritize:
//
// - bicycle lanes
// - low-traffic roads
// - safer intersections
// - manageable elevation changes
// ------------------------------------------------------------

class CyclingRouteStrategy implements RouteStrategy {
  calculateRoute(start: MapPoint, destination: MapPoint): RouteResult {
    console.log('Loading bicycle route data...');
    console.log('Finding bicycle lanes...');
    console.log('Checking road traffic...');
    console.log('Checking elevation changes...');
    console.log('Selecting a safe cycling path...');

    return {
      description:
        `Cycle from ${start.name} to ${destination.name} ` +
        'using bicycle lanes and low-traffic roads.',
      distanceKm: 20,
      estimatedMinutes: 75,
    };
  }
}

// ------------------------------------------------------------
// Concrete strategy: public transit
// ------------------------------------------------------------
//
// This class contains only the algorithm and rules needed for
// calculating a public-transit route.
//
// Public-transit routes may prioritize:
//
// - bus and train schedules
// - nearby stops
// - transfer times
// - walking distance to and from stations
// ------------------------------------------------------------

class PublicTransitRouteStrategy implements RouteStrategy {
  calculateRoute(start: MapPoint, destination: MapPoint): RouteResult {
    console.log('Loading public-transit schedules...');
    console.log('Finding nearby stops...');
    console.log('Checking bus and train availability...');
    console.log('Calculating transfers...');
    console.log('Selecting the fastest transit route...');

    return {
      description:
        `Travel from ${start.name} to ${destination.name} ` +
        'using a combination of walking, buses, and trains.',
      distanceKm: 22,
      estimatedMinutes: 48,
    };
  }
}

// ------------------------------------------------------------
// Context class
// ------------------------------------------------------------
//
// In the Strategy Pattern, the object that uses a strategy is
// commonly called the context.
//
// MapNavigator owns the stable navigation workflow:
//
// - validate the starting point
// - validate the destination
// - delegate route calculation to the current strategy
//
// MapNavigator does not know how driving, walking, cycling, or
// public-transit routes are calculated.
//
// It only knows that every strategy implements RouteStrategy.
// ------------------------------------------------------------

class MapNavigator {
  // The navigator stores a reference to the current strategy.
  //
  // The declared type is RouteStrategy, not a concrete strategy
  // such as DrivingRouteStrategy.
  constructor(private routeStrategy: RouteStrategy) {}

  // ----------------------------------------------------------
  // Change the routing strategy
  // ----------------------------------------------------------
  //
  // This method allows the client to replace the algorithm while
  // the program is running.
  //
  // For example, the same MapNavigator object can first calculate
  // a driving route and then calculate a walking route.
  // ----------------------------------------------------------
  setRouteStrategy(routeStrategy: RouteStrategy): void {
    this.routeStrategy = routeStrategy;
  }

  // ----------------------------------------------------------
  // Main public operation
  // ----------------------------------------------------------
  //
  // MapNavigator performs the shared workflow and delegates the
  // variable part of the operation to the current strategy.
  //
  // The key Strategy Pattern line is:
  //
  // this.routeStrategy.calculateRoute(...)
  //
  // MapNavigator does not use conditionals to determine whether
  // the route is for driving, walking, cycling, or transit.
  // ----------------------------------------------------------
  createRoute(start: MapPoint, destination: MapPoint): RouteResult {
    this.validatePoints(start, destination);

    return this.routeStrategy.calculateRoute(start, destination);
  }

  // ----------------------------------------------------------
  // Shared validation
  // ----------------------------------------------------------
  //
  // This validation applies to every routing strategy, so it
  // remains inside MapNavigator.
  // ----------------------------------------------------------
  private validatePoints(start: MapPoint, destination: MapPoint): void {
    this.validatePoint(start, 'Starting point');
    this.validatePoint(destination, 'Destination');

    const pointsHaveSameCoordinates =
      start.latitude === destination.latitude &&
      start.longitude === destination.longitude;

    if (pointsHaveSameCoordinates) {
      throw new Error('The starting point and destination must be different.');
    }
  }

  // Validates one geographic point.
  private validatePoint(point: MapPoint, label: string): void {
    if (point.name.trim().length === 0) {
      throw new Error(`${label} must have a name.`);
    }

    if (!Number.isFinite(point.latitude)) {
      throw new Error(`${label} latitude must be a finite number.`);
    }

    if (!Number.isFinite(point.longitude)) {
      throw new Error(`${label} longitude must be a finite number.`);
    }

    if (point.latitude < -90 || point.latitude > 90) {
      throw new Error(`${label} latitude must be between -90 and 90.`);
    }

    if (point.longitude < -180 || point.longitude > 180) {
      throw new Error(`${label} longitude must be between -180 and 180.`);
    }
  }
}

// ------------------------------------------------------------
// Example geographic points
// ------------------------------------------------------------

const universityCampus: MapPoint = {
  name: 'University Campus',
  latitude: 48.734,
  longitude: -122.486,
};

const regionalAirport: MapPoint = {
  name: 'Regional Airport',
  latitude: 48.793,
  longitude: -122.537,
};

// ------------------------------------------------------------
// Client code
// ------------------------------------------------------------
//
// The client chooses which strategy should be used.
//
// We use the name "mapNavigator" instead of "navigator" because
// browsers already provide a global navigator object.
// ------------------------------------------------------------

// Create the navigator with a driving strategy.
//
// The strategy is supplied through the constructor. This is a
// form of dependency injection.
const mapNavigator = new MapNavigator(new DrivingRouteStrategy());

// ------------------------------------------------------------
// Calculate a driving route
// ------------------------------------------------------------

const drivingRoute = mapNavigator.createRoute(
  universityCampus,
  regionalAirport,
);

console.log('\nDriving route:');
console.log(drivingRoute);

// ------------------------------------------------------------
// Replace the strategy with a walking strategy
// ------------------------------------------------------------
//
// MapNavigator itself does not change. Only the strategy object
// used by MapNavigator changes.
// ------------------------------------------------------------

mapNavigator.setRouteStrategy(new WalkingRouteStrategy());

const walkingRoute = mapNavigator.createRoute(
  universityCampus,
  regionalAirport,
);

console.log('\nWalking route:');
console.log(walkingRoute);

// ------------------------------------------------------------
// Replace the strategy with a cycling strategy
// ------------------------------------------------------------

mapNavigator.setRouteStrategy(new CyclingRouteStrategy());

const cyclingRoute = mapNavigator.createRoute(
  universityCampus,
  regionalAirport,
);

console.log('\nCycling route:');
console.log(cyclingRoute);

// ------------------------------------------------------------
// Replace the strategy with a public-transit strategy
// ------------------------------------------------------------

mapNavigator.setRouteStrategy(new PublicTransitRouteStrategy());

const publicTransitRoute = mapNavigator.createRoute(
  universityCampus,
  regionalAirport,
);

console.log('\nPublic-transit route:');
console.log(publicTransitRoute);
