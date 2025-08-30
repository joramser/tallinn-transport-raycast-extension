import { fetchRoutes, fetchStops, type RouteRaw, type StopRaw } from "@/api";
import { extractAllRoutes, type Route } from "@/lib/routes";
import { extractAllStops, type Stop } from "@/lib/stops";
import Papa from "papaparse";
import { Cache } from "@raycast/api";

const cache = new Cache();

const ROUTES_CACHE_TIMESTAMP_KEY = "ROUTES_CACHE_TIMESTAMP";
const CACHE_EXPIRY = 1000 * 60 * 30;
const ROUTES_CACHE_KEY = "ROUTES_DATA";
const STOPS_CACHE_KEY = "STOPS_DATA";

export const getAllRoutesData = async () => {
  if (cache.get(ROUTES_CACHE_TIMESTAMP_KEY)) {
    const cachedTimestamp = parseInt(cache.get(ROUTES_CACHE_TIMESTAMP_KEY) || "0", 10);
    const currentTime = Date.now();

    if (currentTime - cachedTimestamp < CACHE_EXPIRY) {
      const routes = JSON.parse(cache.get(ROUTES_CACHE_KEY) || "[]") as Route[];
      const stops = new Map<string, Stop>(JSON.parse(cache.get(STOPS_CACHE_KEY) || "[]"));
      return { routes, stops };
    }
  }

  const [routesRaw, stopsRaw] = await Promise.all([fetchRoutes(), fetchStops()]);

  const parsedRoutes = Papa.parse<RouteRaw>(routesRaw, { header: true, delimiter: ";" });
  const parsedStops = Papa.parse<StopRaw>(stopsRaw, { header: true, delimiter: ";" });

  if (!Array.isArray(parsedRoutes.data)) {
    throw new Error("Invalid routes data");
  }
  if (!Array.isArray(parsedStops.data)) {
    throw new Error("Invalid stops data");
  }

  const { routes, relevantStopIds } = extractAllRoutes(parsedRoutes.data);
  const { stops } = extractAllStops(parsedStops.data, relevantStopIds);

  cache.set(ROUTES_CACHE_KEY, JSON.stringify(routes));
  cache.set(STOPS_CACHE_KEY, JSON.stringify(Array.from(stops)));
  cache.set(ROUTES_CACHE_TIMESTAMP_KEY, Date.now().toString());

  return { routes, stops };
};
