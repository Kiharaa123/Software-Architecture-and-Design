// Check lại phần cập nhập route

import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setDriverLocation, setStage } from "../store/tripSlice";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
if (!MAPBOX_TOKEN) {
  console.error(
    "Mapbox API token is missing. Please set VITE_MAPBOX_API_KEY in your .env file."
  );
}
mapboxgl.accessToken = MAPBOX_TOKEN || "";

const calculateDistance = (
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const pickupMarker = useRef<Marker | null>(null);
  const dropoffMarker = useRef<Marker | null>(null);
  const driverMarker = useRef<Marker | null>(null);
  const routeCoordinatesRef = useRef<number[][] | null>(null);
  const currentSegmentRef = useRef(0);
  const dispatch = useDispatch();

  const { pickupLocation, dropoffLocation, driverLocation, stage } =
    useSelector((state: RootState) => state.trip);
  const [driverSpeed, setDriverSpeed] = useState<number>(0);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 0], // Default center
      zoom: 2, // Default zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add or update pickup marker
  useEffect(() => {
    if (!map.current || !pickupLocation) return;

    if (!pickupMarker.current) {
      pickupMarker.current = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
        .addTo(map.current);
    } else {
      pickupMarker.current.setLngLat([
        pickupLocation.longitude,
        pickupLocation.latitude,
      ]);
    }
    // Set map center to pickup location
    map.current.setCenter([pickupLocation.longitude, pickupLocation.latitude]);
    map.current.setZoom(13); // Adjust zoom level as needed
  }, [pickupLocation]);

  // Add or update dropoff marker
  useEffect(() => {
    if (!map.current || !dropoffLocation) return;

    if (!dropoffMarker.current) {
      dropoffMarker.current = new mapboxgl.Marker({ color: "green" })
        .setLngLat([dropoffLocation.longitude, dropoffLocation.latitude])
        .addTo(map.current);
    } else {
      dropoffMarker.current.setLngLat([
        dropoffLocation.longitude,
        dropoffLocation.latitude,
      ]);
    }
  }, [dropoffLocation]);

  // Add or update driver marker
  useEffect(() => {
    if (!map.current || !driverLocation) return;

    if (!driverMarker.current) {
      const el = document.createElement("div");
      el.style.backgroundImage =
        "url(https://img.icons8.com/color/48/000000/car--v1.png)";
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      driverMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([driverLocation.longitude, driverLocation.latitude])
        .addTo(map.current);
    } else {
      driverMarker.current.setLngLat([
        driverLocation.longitude,
        driverLocation.latitude,
      ]);
    }
  }, [driverLocation]);

  // Fetch route from Mapbox Directions API
  const fetchRoute = async (
    from: { longitude: number; latitude: number },
    to: { longitude: number; latitude: number }
  ): Promise<number[][] | null> => {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();
    return data.routes?.[0]?.geometry.coordinates || null;
  };

  // Add route layer to the map
  const addRouteLayer = (
    layerId: string,
    lineColor: string,
    coordinates: number[][]
  ) => {
    if (!map.current) return;

    if (map.current.getSource(layerId)) {
      // Update existing route layer
      (map.current.getSource(layerId) as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      });
    } else {
      // Add new route layer
      map.current.addSource(layerId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });
      map.current.addLayer({
        id: layerId,
        type: "line",
        source: layerId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": lineColor,
          "line-width": 6,
        },
      });
    }
  };

  // Draw pick up - drop off route
  useEffect(() => {
    if (!map.current) return;

    // Draw route from pickup to dropoff
    if (pickupLocation && dropoffLocation) {
      fetchRoute(pickupLocation, dropoffLocation).then((route) => {
        if (route) {
          addRouteLayer("pickup-to-dropoff", "#8FD14F", route);
        }
      });
    }
  }, [dropoffLocation, pickupLocation]);

  // Draw driver to pick up route
  useEffect(() => {
    if (!map.current) return;
    // Draw route from driver to pickup
    if (driverLocation && pickupLocation && stage === "driverFound") {
      // console.log("Start fecth route from driver to pickup location...");
      fetchRoute(driverLocation, pickupLocation).then((route) => {
        if (route) {
          addRouteLayer("driver-to-pickup", "#FF5733", route);
        }
      });
    }
  }, [stage]);

  useEffect(() => {
    if (!map.current) return;
    if (stage === "driverArrivedPickUp") {
      // Remove driver-to-pickup route layer
      if (map.current.getLayer("driver-to-pickup")) {
        map.current.removeLayer("driver-to-pickup");
        map.current.removeSource("driver-to-pickup");
      }
    }
    if (stage === "completed") {
      // Remove pickup-to-dropoff route layer
      if (map.current.getLayer("pickup-to-dropoff")) {
        map.current.removeLayer("pickup-to-dropoff");
        map.current.removeSource("pickup-to-dropoff");
      }
    }
  }, [stage]);

  // Animate the driver along a route
  const animateRoute = (route: number[][], onFinish: () => void) => {
    routeCoordinatesRef.current = route;
    currentSegmentRef.current = 0;

    const animateSegment = () => {
      if (
        !routeCoordinatesRef.current ||
        currentSegmentRef.current >= routeCoordinatesRef.current.length - 1
      ) {
        onFinish();
        return;
      }

      const [startLng, startLat] =
        routeCoordinatesRef.current[currentSegmentRef.current];
      const [endLng, endLat] =
        routeCoordinatesRef.current[currentSegmentRef.current + 1];
      const remainingRoute = routeCoordinatesRef.current.slice(
        currentSegmentRef.current + 1
      );
      const segmentDistance = calculateDistance(
        startLng,
        startLat,
        endLng,
        endLat
      ); // Distance in km
      let distanceTraveled = 0;

      const segmentInterval = setInterval(() => {
        const randomSpeed = Math.random() * (30 - 20) + 20; // Random speed between 20-30 km/h
        setDriverSpeed(randomSpeed);
        const dMove = randomSpeed / 3600; // Distance moved in 100ms
        distanceTraveled += dMove;

        if (distanceTraveled >= segmentDistance) {
          dispatch(setDriverLocation({ latitude: endLat, longitude: endLng }));
          clearInterval(segmentInterval);
          currentSegmentRef.current++;
          animateSegment();
        } else {
          const fraction = distanceTraveled / segmentDistance;
          const currentLng = startLng + fraction * (endLng - startLng);
          const currentLat = startLat + fraction * (endLat - startLat);
          dispatch(
            setDriverLocation({ latitude: currentLat, longitude: currentLng })
          );
          // console.log("Stage current", stage)

          if (stage === "driverToPickUp") {
            // console.log("Update driver-to-pickup route layer")
            // console.log([[currentLng, currentLat], ...remainingRoute])
            addRouteLayer("driver-to-pickup", "#FF5733", [
              [currentLng, currentLat],
              ...remainingRoute,
            ]);
          }
          if (stage === "pickupToDropoff") {
            addRouteLayer("pickup-to-dropoff", "#8FD14F", [
              [currentLng, currentLat],
              ...remainingRoute,
            ]);
          }
        }
      }, 100);
    };

    animateSegment();
  };

  // Animate route based on stage
  useEffect(() => {
    if (!pickupLocation || !driverLocation || !dropoffLocation) return;

    if (stage === "driverFound") {
      dispatch(setStage("driverToPickUp"));
      if (!map.current) return;
      if (map.current.getLayer("pickup-to-dropoff")) {
        map.current.setPaintProperty(
          "pickup-to-dropoff",
          "line-color",
          "#808080"
        );
      }
    } else if (stage === "driverArrivedPickUp") {
      setTimeout(() => {
        dispatch(setStage("pickupToDropoff"));
        if (!map.current) return;
        if (map.current.getLayer("pickup-to-dropoff")) {
          map.current.setPaintProperty(
            "pickup-to-dropoff",
            "line-color",
            "#8FD14F"
          );
        }
      }, 5000);
    }
  }, [stage, driverLocation, pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (!pickupLocation || !driverLocation || !dropoffLocation) return;
    switch (stage) {
      case "driverToPickUp":
        // Animate from driver's current location to pickup
        fetchRoute(driverLocation, pickupLocation).then((route) => {
          // console.log('Driver found, animating to pickup location...');
          // console.log("Driver's current location:", driverLocation);
          // console.log('Pickup location:', pickupLocation);
          // console.log('Route:', route);
          if (route) {
            animateRoute(route, () => {
              // console.log('Driver arrived at pickup location.');
              dispatch(setStage("driverArrivedPickUp"));
            });
          }
        });
        break;
      case "pickupToDropoff":
        // Animate from pickup to dropoff
        fetchRoute(pickupLocation, dropoffLocation).then((route) => {
          if (route) {
            // console.log('Driver en route to dropoff location...');
            // console.log('Pickup location:', pickupLocation);
            // console.log('Dropoff location:', dropoffLocation);
            // console.log('Route:', route);
            animateRoute(route, () => {
              // console.log('Driver arrived at dropoff location.');
              dispatch(setStage("completed"));
            });
          }
        });
        break;
    }
  }, [stage]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-screen" />
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded shadow text-sm">
        <div>
          Driver Speed: {driverSpeed > 0 ? driverSpeed.toFixed(0) : "N/A"} km/h
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
