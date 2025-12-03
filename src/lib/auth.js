// src/lib/auth.js

export const API_BASE = "http://localhost:5000"; // ⛔ no double /api/api !!!

// ----- Generic GET -----
export async function apiGet(url, token) {
  const res = await fetch(API_BASE + url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

// ----- Generic POST -----
export async function apiPost(url, body, token) {
  const res = await fetch(API_BASE + url, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ----- Save token -----
export function saveAuth(user, token) {
  localStorage.setItem("auth_user", JSON.stringify(user));
  localStorage.setItem("auth_token", token);
}

// ----- Get token -----
export function getToken() {
  return localStorage.getItem("auth_token");
}

// ----- Get user -----
export function getUserFromStorage() {
  const u = localStorage.getItem("auth_user");
  return u ? JSON.parse(u) : null;
}

// ----- Logout -----
export function logout() {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");
}
