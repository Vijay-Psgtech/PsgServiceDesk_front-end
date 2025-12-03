// src/lib/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path) {
  return `${BASE_URL}/api${path}`;
}

async function handleResponse(res) {
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(JSON.stringify(json));
    return json;
  } catch {
    if (!res.ok) throw new Error(text || res.statusText);
    try { return JSON.parse(text); } catch { return text; }
  }
}

/* ----------------- POST ----------------- */
export async function apiPost(path, body = {}) {
  const url = buildUrl(path);
  console.log("POST", url, body);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

/* ----------------- GET ------------------ */
export async function apiGet(path) {
  const url = buildUrl(path);
  const res = await fetch(url, { credentials: "include" });
  return handleResponse(res);
}

/* ----------------- PATCH ---------------- */
export async function apiPatch(path, body = {}) {
  const url = buildUrl(path);
  console.log("PATCH", url, body);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}