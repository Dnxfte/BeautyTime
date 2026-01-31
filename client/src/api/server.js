import { supabase } from "../../supabaseConfig";

export const SERVER_URL = "https://beauty-time-server.vercel.app";

export async function apiRequest(path, options = {}) {
  const requireAuth = options.requireAuth !== false;
  let { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;
  if (requireAuth && !token) {
    try {
      const refreshResult = await supabase.auth.refreshSession();
      session = refreshResult.data?.session || session;
      token = session?.access_token;
    } catch {
      // ignore refresh errors, will throw Unauthorized below
    }
  }
  if (!token) {
    console.log("API TOKEN missing", { hasSession: !!session });
  }
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (requireAuth && !token) {
    throw new Error("Unauthorized");
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${SERVER_URL}${normalizedPath}`;
  const res = await fetch(url, { ...options, headers });
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
