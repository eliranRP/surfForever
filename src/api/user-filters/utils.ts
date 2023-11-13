import dayjs from "dayjs";

export const normalizeTimestamp = (timestamp: number) => {
  // Convert UNIX timestamp to dayjs object
  const dt = dayjs.unix(timestamp);

  // Normalize to the same day at midnight
  const normalizedDt = dt.startOf('day');

  // Convert the normalized dayjs object back to UNIX timestamp
  const normalizedUnixTime = normalizedDt.unix();

  return normalizedUnixTime;
};
