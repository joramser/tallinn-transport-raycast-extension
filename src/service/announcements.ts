import { fetchAnnouncements } from "@/api";
import { Cache } from "@raycast/api";

const cache = new Cache();

const ANNOUNCEMENTS_CACHE_KEY = "ANNOUNCEMENTS_DATA";
const ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY = "ANNOUNCEMENTS_CACHE_TIMESTAMP";

export const getAnnouncements = async () => {
  if (cache.get(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY)) {
    const cachedTimestamp = parseInt(cache.get(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY) || "0", 10);
    const currentTime = Date.now();
    const cacheDuration = 1000 * 60 * 30;

    if (currentTime - cachedTimestamp < cacheDuration) {
      const announcements = JSON.parse(cache.get(ANNOUNCEMENTS_CACHE_KEY) || "[]");
      return Promise.resolve(announcements);
    }
  }

  const data = await fetchAnnouncements();

  cache.set(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(data));
  cache.set(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY, Date.now().toString());

  return data;
};
