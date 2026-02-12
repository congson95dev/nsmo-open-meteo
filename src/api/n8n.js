import { APP_CONFIG } from "../config";
import { httpJson } from "./http";
import { DEFAULT_CONFIG } from "../data/defaults";

function getBaseUrl() {
  return (
    import.meta?.env?.VITE_N8N_BASE_URL ||
    APP_CONFIG.n8nBaseUrl ||
    globalThis.__N8N_BASE_URL__ ||
    ""
  ).trim();
}

let didLogEnv = false;
function logEnvOnce() {
  if (didLogEnv || !import.meta?.env?.DEV) return;
  didLogEnv = true;
  // eslint-disable-next-line no-console
  console.log("[n8n env]", {
    viteBaseUrl: import.meta?.env?.VITE_N8N_BASE_URL,
    appConfigBaseUrl: APP_CONFIG.n8nBaseUrl,
    mode: import.meta?.env?.MODE,
  });
}

function ensureBaseUrl() {
  logEnvOnce();
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("Missing n8n base URL (VITE_N8N_BASE_URL)");
  }
  return baseUrl;
}

function n8nUrl(path) {
  const baseUrl = ensureBaseUrl();
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

function parsePowerCurve(input) {
  if (!input) return DEFAULT_CONFIG.hourly.powerCurve;
  if (Array.isArray(input)) return input;
  if (typeof input !== "string") return DEFAULT_CONFIG.hourly.powerCurve;
  const tuples = [];
  const regex = /\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(input))) {
    const parts = match[1].split(",").map((item) => item.trim());
    if (parts.length >= 2) {
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        tuples.push([x, y]);
      }
    }
  }
  return tuples.length ? tuples : DEFAULT_CONFIG.hourly.powerCurve;
}

function stringifyPowerCurve(curve) {
  if (!Array.isArray(curve)) return String(curve || "");
  const body = curve
    .map(([x, y]) => `(${Number(x)}, ${Number(y)})`)
    .join(", ");
  return `[ ${body} ]`;
}

export async function fetchUser(username, password) {
  ensureBaseUrl();
  return httpJson(n8nUrl(APP_CONFIG.endpoints.login), {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function registerUser(payload) {
  ensureBaseUrl();
  return httpJson(n8nUrl(APP_CONFIG.endpoints.register), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchConfig(section) {
  ensureBaseUrl();
  const url = new URL(n8nUrl(APP_CONFIG.endpoints.config));
  url.searchParams.set("section", section);
  const res = await httpJson(url.toString(), { method: "GET" });
  const data = res?.data;
  if (!data) return null;
  return {
    latitude: data.lat ?? DEFAULT_CONFIG.hourly.latitude,
    longitude: data.long ?? DEFAULT_CONFIG.hourly.longitude,
    totalCapacity:
      data.total_plant_capacity ?? DEFAULT_CONFIG.hourly.totalCapacity,
    turbineCount: data.turbine_number ?? DEFAULT_CONFIG.hourly.turbineCount,
    powerCurve: parsePowerCurve(data.power_curve),
  };
}

export async function saveConfig(payload) {
  ensureBaseUrl();
  const cfg = payload?.config || {};
  return httpJson(n8nUrl(APP_CONFIG.endpoints.config), {
    method: "POST",
    body: JSON.stringify({
      lat: cfg.latitude,
      long: cfg.longitude,
      total_plant_capacity: cfg.totalCapacity,
      turbine_number: cfg.turbineCount,
      power_curve: stringifyPowerCurve(cfg.powerCurve),
      section: payload?.period,
    }),
  });
}

export async function calcPower(payload) {
  ensureBaseUrl();
  const cfg = payload?.config || {};
  return httpJson(n8nUrl(APP_CONFIG.endpoints.calcPower), {
    method: "POST",
    body: JSON.stringify({
      lat: cfg.latitude,
      long: cfg.longitude,
      turbine_number: cfg.turbineCount,
      power_curve: stringifyPowerCurve(cfg.powerCurve),
      section: payload?.section,
      wind_speed: payload?.windSpeed,
    }),
  });
}
