import { ActionPanel, List, showToast, Toast } from "@raycast/api";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TurndownService from "turndown";
import { Announcement, getAnnouncements } from "./service/announcements";

const turndownService = new TurndownService();

function AnnouncementsList() {
  const { data, isLoading, error } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (error) {
    showToast({
      title: "Error fetching announcements",
      message: error instanceof Error ? error.message : String(error),
      style: Toast.Style.Failure,
    });
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search announcements..."
      selectedItemId={selectedId || undefined}
      onSelectionChange={setSelectedId}
      isShowingDetail
    >
      {data?.map((announcement: Announcement) => (
        <List.Item
          key={announcement.title + announcement.publication_start_time}
          id={announcement.title + announcement.publication_start_time}
          title={announcement.title}
          detail={
            <List.Item.Detail
              markdown={`# ${announcement.title}\n\n${turndownService.turndown(announcement.info)}`}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Transport" text={announcement.transport} />
                  <List.Item.Detail.Metadata.Label title="Routes" text={announcement.routes} />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={<ActionPanel />}
        />
      ))}
    </List>
  );
}

const queryClient = new QueryClient();

export default function Command() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnnouncementsList />
    </QueryClientProvider>
  );
}
