import { useEffect, useState, useCallback, useRef } from 'react';

interface PlaceResult {
  placePrediction: {
    placeId: string;
    text: {
      text: string;
    };
    structuredFormat: {
      mainText: {
        text: string;
      };
      secondaryText?: {
        text: string;
      };
    };
  };
}

interface PlaceDetails {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  formatted_address?: string;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const useGooglePlacesAutocomplete = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [predictions, setPredictions] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Check if Google Places is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeServices();
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkLoaded);
          initializeServices();
          setIsLoaded(true);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Load Google Places API with loading=async parameter
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&callback=initGooglePlaces&loading=async`;
    script.async = true;
    script.defer = true;

    window.initGooglePlaces = () => {
      initializeServices();
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove the script or callback as other components might be using it
    };
  }, []);

  const initializeServices = () => {
    if (window.google && window.google.maps) {
      // Both AutocompleteSuggestion and Place are static classes in the new API
      // We'll use them directly when needed
    }
  };

  const searchPlaces = useCallback(async (input: string): Promise<void> => {
    if (!input.trim() || input.length < 2) {
      setPredictions([]);
      return;
    }

    // Check if Google Places is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Places API not loaded yet');
      return;
    }

    setIsSearching(true);

    try {
      // Using the new fetchAutocompleteSuggestions method - without limit property
      const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        includedPrimaryTypes: ['locality', 'administrative_area_level_3', 'sublocality'], // Cities and areas
        includedRegionCodes: ['us', 'ca'], // US and Canada
      });

      // Manually limit results to 8
      const limitedSuggestions = suggestions ? suggestions.slice(0, 8) : [];
      setPredictions(limitedSuggestions);
    } catch (error) {
      console.error('Error searching places:', error);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    // Check if Google Places is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Places API not loaded yet');
      return null;
    }

    try {
      // Create a new Place instance
      const place = new window.google.maps.places.Place({
        id: placeId,
      });

      // Fetch the fields we need
      await place.fetchFields({
        fields: ['location', 'addressComponents', 'formattedAddress'],
      });

      // Extract city and state/province from address components
      let city = '';
      let state = '';
      let country = '';

      if (place.addressComponents) {
        for (const component of place.addressComponents) {
          const types = component.types;
          if (types.includes('locality')) {
            city = component.longText || component.long_name || '';
          } else if (types.includes('administrative_area_level_1')) {
            // State for US, Province for Canada
            state = component.shortText || component.short_name || '';
          } else if (types.includes('country')) {
            country = component.shortText || component.short_name || '';
          }
          // Also check for neighborhood/sublocality if no city found
          if (!city && (types.includes('neighborhood') || types.includes('sublocality'))) {
            city = component.longText || component.long_name || '';
          }
        }
      }

      return {
        lat: place.location.lat(),
        lng: place.location.lng(),
        city,
        state,
        formatted_address: place.formattedAddress || '',
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }, []);

  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);

  return {
    isLoaded,
    predictions,
    isSearching,
    searchPlaces,
    getPlaceDetails,
    clearPredictions,
  };
};