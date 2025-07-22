import { fetchAnnouncements } from "../api";

export type Announcement = {
  transport: string;
  routes: string;
  stops: string;
  info: string;
  stop_codes: string;
  publication_start_time: string;
  publication_end_time: string;
  valid_start_time: string;
  valid_end_time: string | null;
  title: string;
};

export const getAnnouncements = () => {
  return fetchAnnouncements() as Promise<Announcement[]>;
};
