import { Action, ActionPanel, Color, List } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { format, formatDistanceToNow } from "date-fns";
import { getAllRoutesData } from "./service";
import { getDeparturesForStop } from "./service/departures";
import type { Stop } from "./service/stops";

function StopsList() {
  const { data, isLoading } = usePromise(() => getAllRoutesData(), [], {
    failureToastOptions: {
      title: "Error fetching stops",
    },
  });

  const relevantStops = [...new Set(data?.routes.flatMap((route) => route.stopIds))];

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search stop name...">
      {relevantStops?.map((stopId) => {
        const stop = data?.stops.get(stopId);

        if (!stop) {
          return null;
        }

        return (
          <List.Item
            key={stop.id}
            id={stop.id}
            title={stop.name}
            actions={
              <ActionPanel>
                <Action.Push title="Show Departures" target={<DeparturesList stop={stop} />} />
                <Action.OpenInBrowser
                  title="Open in Google Maps"
                  url={`https://maps.google.com/?q=${stop.latitude},${stop.longitude}`}
                />
                <Action.OpenInBrowser
                  title="Open in Apple Maps"
                  url={`https://maps.apple.com/?q=${stop.latitude},${stop.longitude}`}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

function DeparturesList({ stop }: { stop: Stop }) {
  const { data, isLoading } = usePromise((siriId: string) => getDeparturesForStop(siriId), [stop.siriId], {
    failureToastOptions: {
      title: "Error fetching departures",
    },
  });

  return (
    <List
      isLoading={isLoading}
      navigationTitle={`Departures for ${stop.name}`}
      searchBarPlaceholder="Search departure..."
    >
      {data?.map((departure) => (
          <List.Item
            key={departure.routeNumber}
            title={`${departure.routeNumber}`}
            subtitle={`in ${formatDistanceToNow(departure.expectedIn)} - ${format(departure.expectedIn, "HH:mm")}`}
            accessories={[
              {
                tag: {
                  value: departure.transportType,
                  color: departure.transportType === "bus" ? Color.Blue : Color.Red,
                },
              },
              {
                tag: {
                  value: departure.destination,
                  color: Color.Green,
                },
              },
            ]}
          />
      ))}
    </List>
  );
}

export default function Command() {
  return <StopsList />;
}
