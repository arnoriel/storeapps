"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Default center: Jakarta
const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };

interface LocationPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }, address: string) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

export default function LocationPicker({
  onLocationSelect,
  initialCoords,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { geocode, isLoading } = useReverseGeocode();

  const handleLocationChange = useCallback(
    async (lat: number, lng: number) => {
      const result = await geocode(lat, lng);
      const resolvedAddress = result?.full_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(resolvedAddress);
      onLocationSelect({ lat, lng }, resolvedAddress);
    },
    [geocode, onLocationSelect]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "placeholder") return;

    // Dynamic import untuk avoid SSR issue
    import("mapbox-gl").then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      const center = initialCoords
        ? [initialCoords.lng, initialCoords.lat]
        : [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: center as [number, number],
        zoom: 12,
      });

      // Marker draggable
      const marker = new mapboxgl.default.Marker({ draggable: true, color: "#000000" })
        .setLngLat(center as [number, number])
        .addTo(map);

      // Drag end
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        handleLocationChange(lngLat.lat, lngLat.lng);
      });

      // Klik peta → pindah marker
      map.on("click", (e) => {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        handleLocationChange(e.lngLat.lat, e.lngLat.lng);
      });

      map.on("load", () => setIsMapLoaded(true));

      mapRef.current = map;
      markerRef.current = marker;

      // Trigger geocode untuk posisi awal
      if (initialCoords) {
        handleLocationChange(initialCoords.lat, initialCoords.lng);
      } else {
        handleLocationChange(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "placeholder") {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Mapbox token belum dikonfigurasi
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map container */}
      <div className="relative w-full h-52 md:h-80 rounded-xl overflow-hidden border">
        <div ref={mapContainerRef} className="w-full h-full" />
        {!isMapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
            Memuat peta...
          </div>
        )}
      </div>

      {/* Instruksi */}
      <p className="text-xs text-gray-500">
        Klik pada peta atau drag marker untuk menentukan lokasi pengiriman
      </p>

      {/* Alamat hasil geocode */}
      {address && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-500 text-xs block mb-0.5">
            {isLoading ? "Mencari alamat..." : "Lokasi terdeteksi:"}
          </span>
          <span className="text-gray-800">{address}</span>
        </div>
      )}
    </div>
  );
}