import type { StopRaw } from "@/api";

export type Stop = {
  id: string;
  name: string;
  siriId: string;
  neighborStopIds: string[];
};

const normalizeStops = (rawStops: StopRaw[]) => {
  return rawStops.map((rawStop, i) => {
    if (!rawStop.Name) {
      rawStop.Name = rawStops[i - 1].Name;
    }
    return rawStop;
  });
};

export const extractAllStops = (rawStops: StopRaw[]) => {
  const normalizedStops = normalizeStops(rawStops);

  const stops = new Map<string, Stop>(
    normalizedStops
      .filter((stop) => stop.SiriID)
      .map((stop) => [
        stop.ID,
        {
          id: stop.ID,
          name: stop.Name,
          siriId: stop.SiriID,
          neighborStopIds: stop.Stops?.split(",") || [],
        },
      ]),
  );

  return stops;
};
