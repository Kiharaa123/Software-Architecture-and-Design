import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import {
  setPickupLocation,
  setDropoffLocation,
  setStage,
  setDriverLocation,
  setVehicleType,
  setPrice,
} from "./store/tripSlice";
import MapComponent from "./components/MapComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as MapboxSearchJS from "@mapbox/search-js-react";
import { SearchBoxRetrieveResponse } from "@mapbox/search-js-core";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { stage, vehicleType, price } = useSelector(
    (state: RootState) => state.trip
  );
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pickupValue, setPickupValue] = useState<string>("");
  const [dropoffValue, setDropoffValue] = useState<string>("");
  const [pickupResult, setPickupResult] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [dropoffResult, setDropoffResult] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [priceDetails, setPriceDetails] = useState<{
    BIKE?: number;
    CAR?: number;
    LUXURY?: number;
  }>({});
  const [driverInfo, setDriverInfo] = useState<{
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImg?: string;
  } | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);

  // Ref to track if we've already updated the ride status
  const rideCompletedRef = useRef(false);

  // Vehicle types aligned with backend enum
  const vehicleTypes = {
    BIKE: "Bike",
    CAR: "Car",
    LUXURY: "Luxury",
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentPosition(loc);

          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.longitude},${loc.latitude}.json?access_token=${MAPBOX_TOKEN}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || "Current Location";
          const defaultPickup = { ...loc, address };
          dispatch(setPickupLocation(defaultPickup));
          setPickupResult(defaultPickup);
          setPickupValue(address);
        },
        (error) => console.error("Error fetching current location", error)
      );
    }
  }, [dispatch]);

  const handlePickupChange = (res: SearchBoxRetrieveResponse) => {
    if (res && res.features.length > 0) {
      const newPickup = {
        latitude: res.features[0].geometry.coordinates[1],
        longitude: res.features[0].geometry.coordinates[0],
        address:
          res.features[0].properties.full_address ||
          res.features[0].properties.name,
      };
      setPickupValue(newPickup.address);
      setPickupResult(newPickup);
      dispatch(setPickupLocation(newPickup));

      // If dropoff is already selected, recalculate price
      if (dropoffResult) {
        calculatePrice(
          newPickup.latitude,
          newPickup.longitude,
          dropoffResult.latitude,
          dropoffResult.longitude
        );
      }
    }
  };

  const handleDropoffChange = (res: SearchBoxRetrieveResponse) => {
    if (res && res.features.length > 0) {
      const newDropoff = {
        latitude: res.features[0].geometry.coordinates[1],
        longitude: res.features[0].geometry.coordinates[0],
        address:
          res.features[0].properties.full_address ||
          res.features[0].properties.name,
      };
      setDropoffValue(newDropoff.address);
      setDropoffResult(newDropoff);
      dispatch(setDropoffLocation(newDropoff));

      // If pickup is already selected, calculate price automatically
      if (pickupResult) {
        calculatePrice(
          pickupResult.latitude,
          pickupResult.longitude,
          newDropoff.latitude,
          newDropoff.longitude
        );
      }
    }
  };

  const calculatePrice = async (
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number
  ) => {
    try {
      const url = `${API_URL}/rides/price?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropoffLat=${dropoffLat}&dropoffLng=${dropoffLng}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to calculate price");
      }

      const responseData = await response.json();
      const basePrice = responseData.data;

      setDistance(basePrice.distance);
      setDuration(basePrice.duration);

      // Calculate prices for all vehicle types
      const prices = {
        BIKE: await fetchVehiclePrice(
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          "BIKE"
        ),
        CAR: await fetchVehiclePrice(
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          "CAR"
        ),
        LUXURY: await fetchVehiclePrice(
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
          "LUXURY"
        ),
      };

      setPriceDetails(prices);
    } catch (error) {
      console.error("Error calculating price:", error);
      toast.error("Error calculating ride price. Please try again.");
    }
  };

  const fetchVehiclePrice = async (
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    vehicleType: string
  ) => {
    const url = `${API_URL}/rides/price?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropoffLat=${dropoffLat}&dropoffLng=${dropoffLng}&vehicleType=${vehicleType}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.data.price;
    }
    return null;
  };

  const handleConfirmLocations = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupResult && dropoffResult) {
      dispatch(setStage("selectVehicle"));
    } else {
      toast.error("Please select both pickup and dropoff locations.");
    }
  };

  const handleSelectVehicle = (vehicle: string) => {
    if (
      pickupResult &&
      dropoffResult &&
      priceDetails[vehicle as keyof typeof priceDetails]
    ) {
      dispatch(setVehicleType(vehicle));
      dispatch(
        setPrice(priceDetails[vehicle as keyof typeof priceDetails] || 0)
      );
      dispatch(setStage("confirmRide"));
    } else {
      toast.error("Error calculating price. Please try again.");
    }
  };

  const handleConfirmRide = async () => {
    if (!pickupResult || !dropoffResult) {
      toast.error("Location information missing");
      return;
    }

    try {
      dispatch(setStage("findingDriver"));

      // Make API call to create ride
      // Note: This would need a customerId from auth state in a real app
      // Right now missing customerId
      const response = await fetch(`${API_URL}/rides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // No customerId as of now
          pickupLatitude: pickupResult.latitude,
          pickupLongitude: pickupResult.longitude,
          pickupAddress: pickupResult.address,
          dropoffLatitude: dropoffResult.latitude,
          dropoffLongitude: dropoffResult.longitude,
          dropoffAddress: dropoffResult.address,
          vehicleType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ride");
      }

      const rideData = await response.json();

      // Store ride ID for status updates
      if (rideData.data?.id) {
        setRideId(rideData.data.id);
      }

      // Set driver location from response
      if (rideData.driver?.user?.currentLocation) {
        const driverLoc = {
          latitude: rideData.driver.user.currentLocation.latitude,
          longitude: rideData.driver.user.currentLocation.longitude,
          address: "Driver Location",
        };
        dispatch(setDriverLocation(driverLoc));
      } else {
        // Fallback if driver location not available
        const randomOffset = () => (Math.random() - 0.5) * 0.018;
        const driverStart = {
          latitude: pickupResult.latitude + randomOffset(),
          longitude: pickupResult.longitude + randomOffset(),
          address: "Driver Location",
        };
        dispatch(setDriverLocation(driverStart));
      }

      // Set driver info from response
      if (rideData.data.driver?.user) {
        const driver = rideData.data.driver;
        setDriverInfo({
          id: driver.id,
          firstName: driver.user.firstName || "Driver",
          lastName: driver.user.lastName || "",
          phone: driver.user.phone || "Not available",
          profileImg: driver.user.profileImg,
        });
      }

      dispatch(setStage("driverFound"));

      // In a real app, you would set up a websocket connection here
      // to receive updates on ride status changes
    } catch (error) {
      console.error("Error creating ride:", error);
      toast.error("Error creating ride. Please try again.");
      dispatch(setStage("selectLocations"));
    }
  };

  // Auto-update ride status when stage changes to completed
  useEffect(() => {
    const autoUpdateRideStatus = async () => {
      // Only run if we're at the completed stage, have a rideId, and haven't already updated
      if (stage === "completed" && rideId && !rideCompletedRef.current) {
        try {
          rideCompletedRef.current = true; // Prevent multiple calls

          const response = await fetch(`${API_URL}/rides/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rideId,
              status: "COMPLETED",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update ride status");
          }

          await response.json();
          toast.success("The trip has been completed!");
        } catch (error) {
          console.error("Error auto-updating ride status:", error);
          toast.error("Failed to update ride status on server");
        }
      }
    };

    autoUpdateRideStatus();
  }, [stage, rideId]);

  // Reset the completion flag when starting a new ride
  useEffect(() => {
    if (stage === "selectLocations") {
      rideCompletedRef.current = false;
    }
  }, [stage]);

  // Component for driver info display
  const DriverInfoCard = () => {
    if (!driverInfo) return null;

    return (
      <div className="flex items-center mb-4 border-b pb-4">
        {driverInfo.profileImg ? (
          <img
            src={driverInfo.profileImg}
            alt="Driver"
            className="w-16 h-16 rounded-full mr-4 object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full mr-4 bg-gray-300 flex items-center justify-center text-lg font-medium">
            {driverInfo.firstName?.charAt(0) || "TX"}
          </div>
        )}
        <div>
          <h3 className="font-bold">
            {driverInfo.firstName} {driverInfo.lastName}
          </h3>
          <p className="text-sm text-gray-600">Driver</p>
          <p className="text-sm mt-1">📱 {driverInfo.phone}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 p-4">
          {stage === "selectLocations" && (
            <div className="bg-white p-6 rounded shadow mb-4">
              <h2 className="text-2xl font-bold mb-4">Plan Your Ride</h2>
              <form onSubmit={handleConfirmLocations}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">
                    Pickup Location
                  </label>
                  {/* @ts-expect-error - SearchBox has type issues but works fine at runtime */}
                  <MapboxSearchJS.SearchBox
                    accessToken={MAPBOX_TOKEN}
                    options={{
                      proximity: currentPosition
                        ? {
                            lng: currentPosition.longitude,
                            lat: currentPosition.latitude,
                          }
                        : undefined,
                    }}
                    value={pickupValue}
                    onRetrieve={handlePickupChange}
                    placeholder="Enter pickup address"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">
                    Dropoff Location
                  </label>
                  {/* @ts-expect-error - SearchBox has type issues but works fine at runtime */}
                  <MapboxSearchJS.SearchBox
                    accessToken={MAPBOX_TOKEN}
                    options={{
                      proximity: currentPosition
                        ? {
                            lng: currentPosition.longitude,
                            lat: currentPosition.latitude,
                          }
                        : undefined,
                    }}
                    value={dropoffValue}
                    onRetrieve={handleDropoffChange}
                    placeholder="Enter dropoff address"
                  />
                </div>
                {distance && (
                  <p className="mb-4 text-gray-600">
                    Distance: {distance.toFixed(2)} km
                  </p>
                )}
                {duration && (
                  <p className="mb-4 text-gray-600">
                    Estimated time: {Math.round(duration)} minutes
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Confirm Locations
                </button>
              </form>
            </div>
          )}
          {stage === "selectVehicle" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Select Vehicle</h2>
              {distance && (
                <p className="mb-4 text-gray-600">
                  Distance: {distance.toFixed(2)} km
                </p>
              )}
              {duration && (
                <p className="mb-4 text-gray-600">
                  Estimated time: {Math.round(duration)} minutes
                </p>
              )}
              <div className="flex flex-col gap-3">
                {Object.entries(vehicleTypes).map(([key, label]) => {
                  const vehiclePrice =
                    priceDetails[key as keyof typeof priceDetails];
                  return (
                    <button
                      key={key}
                      className={`py-2 rounded text-white ${
                        vehicleType === key
                          ? "bg-green-600"
                          : "bg-indigo-500 hover:bg-indigo-600"
                      }`}
                      onClick={() => handleSelectVehicle(key)}
                    >
                      {label} - ${vehiclePrice?.toFixed(2)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {stage === "confirmRide" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Confirm Your Ride</h2>
              <p className="mb-4 text-gray-600">
                Vehicle:{" "}
                {vehicleTypes[vehicleType as keyof typeof vehicleTypes]}
              </p>
              <p className="mb-4 text-gray-600">
                Total Price: ${price?.toFixed(2)}
              </p>
              <button
                onClick={handleConfirmRide}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Confirm Ride
              </button>
            </div>
          )}
          {stage === "findingDriver" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Finding a Driver...</h2>
              <p className="text-gray-600">
                Please wait while we find a driver for you.
              </p>
            </div>
          )}
          {(stage === "driverToPickUp" || stage === "driverFound") && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Driver is on the way!</h2>
              <DriverInfoCard />
              <p className="text-gray-600">
                Your driver is heading to the pickup location.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Vehicle:</span>{" "}
                  {vehicleTypes[vehicleType as keyof typeof vehicleTypes]}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Price:</span> ${price?.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          {stage === "driverArrivedPickUp" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Driver has arrived!</h2>
              <DriverInfoCard />
              <p className="text-gray-600">
                Your driver is waiting for you at the pickup location.
              </p>
              <div className="mt-4 p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800 font-bold">
                  Please meet your driver now
                </p>
              </div>
            </div>
          )}
          {stage === "pickupToDropoff" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">
                On the way to dropoff!
              </h2>
              <DriverInfoCard />
              <p className="text-gray-600">Enjoy your ride!</p>
              {distance && duration && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">ETA:</span>{" "}
                    {Math.round(duration)} minutes
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">Distance remaining:</span>{" "}
                    {distance.toFixed(2)} km
                  </p>
                </div>
              )}
            </div>
          )}
          {stage === "completed" && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Ride Completed!</h2>
              <p className="text-gray-600">Thank you for using our service!</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setDriverInfo(null);
                    setRideId(null);
                    rideCompletedRef.current = false;
                    dispatch(setStage("selectLocations"));
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Book Another Ride
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 h-screen">
          <MapComponent />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
