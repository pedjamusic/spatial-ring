import { config } from "../config";

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
export const isAuthenticated = () => Boolean(getToken());
