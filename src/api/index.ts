const BASE_URL = "https://transport.tallinn.ee";

export type RouteBase = {
  RouteNum: string;
  RouteType: string;
  RouteName: string;
  Transport: string;
  RouteStops: string;
};

export type RouteTimes = {
  RouteNum: string;
};

export type RouteRaw = RouteBase | RouteTimes;

export type StopRaw = {
  ID: string;
  Name: string;
  Stops: string;
};

export const HEADERS = {
  Accept: "*/*",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Dest": "empty",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Mode": "cors",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: `${BASE_URL}/`,
  Priority: "u=3, i",
};

export async function fetchRoutes() {
  const res = await fetch(`${BASE_URL}/data/routes.txt?${Date.now()}`, { headers: HEADERS });
  return res.text();
}

export async function fetchStops() {
  const res = await fetch(`${BASE_URL}/data/stops.txt?${Date.now()}`, { headers: HEADERS });
  return res.text();
}

export async function fetchAnnouncements() {
  const res = await fetch(`${BASE_URL}/announcements.json?${Date.now()}`, { headers: HEADERS });
  return res.json();
}
