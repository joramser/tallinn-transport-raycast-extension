import { Action, ActionPanel, Color, Icon, List, showToast, Toast } from "@raycast/api";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { formatDistanceToNow, isAfter } from "date-fns";
import { getAllRoutesData } from "./service";
import { type Route } from "./service/routes";
import { type Stop } from "./service/stops";
import { getTimetables, getWorkdayType, type Timetable } from "./service/timetables";

function RoutesList() {
  const { data, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () =>
      getAllRoutesData()
        .then((data) => data)
        .catch((error) => {
          showToast({
            title: "Error fetching routes from Tallinn Transport",
            message: error.message,
            style: Toast.Style.Failure,
          });
        }),
  });

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search bus or tram line...">
      {data?.routes.map((route: Route) => (
        <List.Item
          key={route.id}
          icon={route.direction === "a-b" ? Icon.ArrowRight : Icon.ArrowLeft}
          title={route.number}
          subtitle={route.name}
          keywords={[route.number, route.name]}
          accessories={[{ tag: { value: route.type, color: route.type === "bus" ? Color.Blue : Color.Red } }]}
          actions={
            <ActionPanel>
              <Action.Push title="Show Stops" target={<StopsList route={route} stopsMap={data?.stops} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export function StopsList({ route, stopsMap }: { route: Route; stopsMap: Map<string, Stop> }) {
  const timetable = useMemo(() => getTimetables(route.times), [route.times]);

  return (
    <List navigationTitle={`Stops for route: ${route.number} - ${route.name}`} searchBarPlaceholder="Search stop name">
      {route.stops.map((stop, index) => {
        const currentStopTimetable = timetable.filter((t) => t.stopIndex === index);
        return (
          <List.Item
            key={stop + index}
            id={stop}
            title={stopsMap.get(stop)?.name || "Unknown stop"}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Times"
                  target={
                    <StopTimesScreen
                      stopName={stopsMap.get(stop)?.name || "Unknown stop"}
                      times={currentStopTimetable}
                    />
                  }
                />
                <Action.OpenInBrowser
                  url={`https://transport.tallinn.ee/#${route.type}/${route.number}/${route.direction}/${stop}`}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

const StopTimesScreen = ({ stopName, times }: { stopName: string; times: Timetable[] }) => {
  const now = new Date();
  const todayWorkday = getWorkdayType(now);
  const filteredTimes = times.filter((t) => t.workday === todayWorkday && t.time > now);

  return (
    <List navigationTitle={`Times for ${stopName} - ${todayWorkday}`} searchBarPlaceholder="Search time">
      {filteredTimes.length === 0 ? (
        <List.Item title="No upcoming times" />
      ) : (
        filteredTimes.map((time, index) => {
          const subtitle = isAfter(time.time, now) ? formatDistanceToNow(time.time, { addSuffix: true }) : undefined;
          return (
            <List.Item
              key={index}
              title={time.time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
              subtitle={subtitle}
            />
          );
        })
      )}
    </List>
  );
};

const queryClient = new QueryClient();

export default function Command() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoutesList />
    </QueryClientProvider>
  );
}
