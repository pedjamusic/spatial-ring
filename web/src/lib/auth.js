// const API_HOST = import.meta.env.VITE_API_BASE_URL || "";
// In prod: http://.../auth/login. In local: /api/auth/login (proxied)
// const LOGIN_URL = API_HOST ? `${API_HOST}/auth/login` : "/api/auth/login";
// Below was a miserable try to get this shit project working
// const LOGIN_URL = "/auth/login";
// ^ const LOGIN_URL HARD FIX for Coolify deployment; This works in local dev because your Vite dev proxy already forwards /auth → http://localhost:3000.This works in prod because your API mounts authRouter at /auth (app.use("/auth", authRouter)) and the router defines POST /login.
// End of miserable effort

import { config } from "../config";
// Should result in "https://api.your-domain.com/auth/login" in Prod
// and Local: "" + "/auth/login" -> "/auth/login"
const LOGIN_URL = `${config.apiUrl}/auth/login`;

export const login = async (credentials) => {
  const response = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Login failed");
  }

  const data = await response.json();
  // Ensure we are storing the token correctly
  if (data.token) {
    localStorage.setItem("token", data.token);
  } else {
    throw new Error("Login response did not include a token.");
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const setToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");
// export const isAuthenticated = () => !!localStorage.getItem('token');
export const isAuthenticated = () => Boolean(getToken());
