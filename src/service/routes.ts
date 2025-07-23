import { RouteBase, RouteRaw } from "../api";

export type Route = {
  id: string;
  number: string;
  name: string;
  type: RouteType;
  direction: RouteDirection;
  stopIds: string[];
  times: string[];
};

export type RouteDirection = "a-b" | "b-a";
export type RouteType = "bus" | "tram";

const normalizeRoutes = (rawRoutes: RouteRaw[]) => {
  const normalizedRoutes: (RouteBase & { times: string })[] = [];

  for (let i = 0; i < rawRoutes.length; i += 1) {
    const rawRoute = rawRoutes[i];

    if (!("RouteName" in rawRoute) || rawRoute.RouteName === "") {
      continue;
    }

    const rawRouteTime = rawRoutes[++i];

    if (!rawRouteTime || "RouteName" in rawRouteTime) {
      continue;
    }

    if (!rawRoute.RouteNum) {
      rawRoute.RouteNum = normalizedRoutes[normalizedRoutes.length - 1].RouteNum;
    }
    if (!rawRoute.Transport) {
      rawRoute.Transport = normalizedRoutes[normalizedRoutes.length - 1].Transport;
    }

    normalizedRoutes.push({ ...rawRoute, times: rawRouteTime.RouteNum });
  }

  return normalizedRoutes;
};

export const extractAllRoutes = (rawRoutes: RouteRaw[]) => {
  const normalizedRoutes = normalizeRoutes(rawRoutes);

  return normalizedRoutes
    .filter((rawRoute) => {
      return ["bus", "tram"].includes(rawRoute.Transport) && ["a-b", "b-a"].includes(rawRoute.RouteType);
    })
    .map<Route>((rawRoute) => {
      return {
        id: `${rawRoute.RouteNum}-${rawRoute.RouteName}`,
        number: rawRoute.RouteNum,
        name: rawRoute.RouteName,
        type: rawRoute.Transport as RouteType,
        direction: rawRoute.RouteType as RouteDirection,
        stopIds: rawRoute.RouteStops.split(","),
        times: rawRoute.times.split(","),
      };
    });
};
