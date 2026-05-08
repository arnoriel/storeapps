import { useState, useCallback } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface GeocodeResult {
  city_name: string;
  full_name: string;
}

export function useReverseGeocode() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeocodeResult | null>(null);

  const geocode = useCallback(async (lat: number, lng: number) => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "placeholder") return null;

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,address&language=id`
      );
      const data = await res.json();
      const features = data.features ?? [];

      if (features.length > 0) {
        const geocodeResult: GeocodeResult = {
          city_name: features[0].text ?? "",
          full_name: features[0].place_name ?? "",
        };
        setResult(geocodeResult);
        return geocodeResult;
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { geocode, result, isLoading };
}