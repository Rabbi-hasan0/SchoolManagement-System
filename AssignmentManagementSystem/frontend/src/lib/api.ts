// frontend/src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5042/api";

export async function fetcher<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // LocalStorage থেকে টোকেন নেওয়া
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "An error occurred while fetching data.");
  }

  return response.json();
}
