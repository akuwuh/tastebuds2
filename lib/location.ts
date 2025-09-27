import { useState, useCallback } from "react";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionState {
  permission: "granted" | "denied" | "prompt" | "loading";
  coordinates: LocationCoordinates | null;
  error: string | null;
}

export async function requestLocationPermission(): Promise<LocationPermissionState> {
  if (!navigator.geolocation) {
    return {
      permission: "denied",
      coordinates: null,
      error: "Geolocation is not supported by this browser",
    };
  }

  try {
    // Check current permission state
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });

    if (permission.state === "denied") {
      return {
        permission: "denied",
        coordinates: null,
        error:
          "Location access denied. Please enable location in your browser settings.",
      };
    }

    // Request location
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            permission: "granted",
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            error: null,
          });
        },
        (error) => {
          let errorMessage = "Failed to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          resolve({
            permission: "denied",
            coordinates: null,
            error: errorMessage,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  } catch (error) {
    return {
      permission: "denied",
      coordinates: null,
      error: "Failed to check location permission",
    };
  }
}

export function useLocationPermission() {
  const [state, setState] = useState<LocationPermissionState>({
    permission: "prompt",
    coordinates: null,
    error: null,
  });

  const requestPermission = useCallback(async () => {
    setState((prev) => ({ ...prev, permission: "loading" }));
    const result = await requestLocationPermission();
    setState(result);
    return result;
  }, []);

  return { ...state, requestPermission };
}
