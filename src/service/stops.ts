import { StopRaw } from "../api";

export type Stop = {
  id: string;
  name: string;
};

function calculateStopName(id: string, rawStops: StopRaw[], visited = new Set<string>()): string | undefined {
  if (visited.has(id)) {
    return;
  }

  visited.add(id);

  const row = rawStops.find((r) => r.ID === id);
  if (!row?.Stops) {
    return;
  }

  if (row.Name) {
    return row.Name;
  }

  const nextIds = row.Stops.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const nextId of nextIds) {
    const found = calculateStopName(nextId, rawStops, visited);
    if (found) {
      return found;
    }
  }
}

export const extractAllStops = (rawStops: StopRaw[]): Map<string, Stop> => {
  const stops = new Map<string, Stop>(
    rawStops.map((stop) => [stop.ID, { id: stop.ID, name: stop.Name || calculateStopName(stop.ID, rawStops) || "" }]),
  );

  return stops;
};
