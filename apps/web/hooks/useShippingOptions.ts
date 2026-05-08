import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ShippingCostDetail {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface ShippingOptionRaw {
  courier: string;
  courier_code: string;
  services: ShippingCostDetail[];
}

interface ShippingCheckResponse {
  destination_city: string;
  origin_city: string;
  weight_grams: number;
  options: ShippingOptionRaw[];
}

export interface FlatShippingOption {
  id: string; // courier_code-service
  courier: string;
  courier_code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

async function fetchShippingOptions(
  lat: number,
  lng: number,
  product_id: string
): Promise<{ options: FlatShippingOption[]; destination_city: string }> {
  const res = await fetch(`${API_URL}/api/v1/shipping/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination_lat: lat,
      destination_lng: lng,
      product_id,
    }),
  });

  if (!res.ok) throw new Error("Gagal mengambil ongkir");

  const data: ShippingCheckResponse = await res.json();

  // Flatten: setiap service jadi satu option
  const flat: FlatShippingOption[] = [];
  for (const courier of data.options) {
    for (const service of courier.services) {
      flat.push({
        id: `${courier.courier_code}-${service.service}`,
        courier: courier.courier,
        courier_code: courier.courier_code,
        service: service.service,
        description: service.description,
        cost: service.cost,
        etd: service.etd,
      });
    }
  }

  return { options: flat, destination_city: data.destination_city };
}

export function useShippingOptions(
  lat: number | null,
  lng: number | null,
  product_id: string | null
) {
  return useQuery({
    queryKey: ["shipping", lat, lng, product_id],
    queryFn: () => fetchShippingOptions(lat!, lng!, product_id!),
    enabled: !!lat && !!lng && !!product_id,
    staleTime: 5 * 60 * 1000, // 5 menit
    retry: 1,
  });
}