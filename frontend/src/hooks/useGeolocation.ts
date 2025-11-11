'use client';
import { useState } from 'react';

interface GeolocationResult {
    locationUrl: string | null;
    error: string | null;
}

// Helper to promisify the callback-based Geolocation API
function getPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

export const useGeolocation = () => {
    const [isFetching, setIsFetching] = useState(false);

    const getCurrentLocation = async (): Promise<GeolocationResult> => {
        if (!navigator.geolocation) {
            return { locationUrl: null, error: "Geolocation is not supported by your browser." };
        }

        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return { locationUrl: null, error: "Geolocation is only available on secure (HTTPS) connections or localhost." };
        }

        setIsFetching(true);

        try {
            const position = await getPosition({
                enableHighAccuracy: true,
                timeout: 20000, // 20 seconds to allow more time for a high-accuracy lock
                maximumAge: 0, // Don't use a cached position
            });

            const { latitude, longitude } = position.coords;
            const locationUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;
            return { locationUrl, error: null };
        } catch (error) {
            let message = "An error occurred while fetching location.";
            if (error instanceof GeolocationPositionError) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "You denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable. Please check your device settings.";
                        break;
                    case error.TIMEOUT:
                        message = "The request to get user location timed out. Please try again, preferably outdoors with a clear view of the sky.";
                        break;
                }
            } else {
                message = "An unknown error occurred while fetching location details.";
            }
            return { locationUrl: null, error: message };
        } finally {
            setIsFetching(false);
        }
    };

    return { isFetching, getCurrentLocation };
};
