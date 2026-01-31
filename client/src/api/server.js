import { supabase } from "../../supabaseConfig";

export const SERVER_URL = "https://beauty-time-server.vercel.app/";

export async function apiRequest(path, options = {}) {
  const requireAuth = options.requireAuth !== false;
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (requireAuth && !token) {
    throw new Error("Unauthorized");
  }
  const res = await fetch(`${SERVER_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}
