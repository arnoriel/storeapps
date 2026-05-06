import { useAuthStore } from "./auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

let isRefreshing = false;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      logout();
      return null;
    }

    const data = await res.json();
    setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    logout();
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Auto refresh jika 401
  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (newToken) {
      // Retry request dengan token baru
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({}));
        throw new Error(error?.detail ?? `HTTP ${retryRes.status}`);
      }

      return retryRes.json();
    }

    // Refresh gagal — redirect ke login
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/login";
    }
    throw new Error("Sesi habis, silakan login kembali");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}

// Untuk upload file (multipart/form-data)
export async function apiUpload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {},
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}