import {
  IUserNotificationSettingsSchema,
  RatingSchema,
  WaveHeightRange,
} from "../users/user-notifications-settings.schema";
import { Forecast } from "../../surfline/types";
import dayjs from "dayjs";
import UserNotificationSettingsModel from "../users/user-notifications-settings.model";
import { getForecast } from "../../surfline/api";
import logger from "../../framework/logger.manager";
import seenForecastModel from "./seen-forecast.model";
import { normalizeTimestamp } from "./utils";

export const matchByRating = (
  preferredRating: RatingSchema,
  forecast: Forecast
): boolean => {
  return forecast.rating.value >= preferredRating.value;
};
export const matchByWaveHeight = (
  preferredWave: WaveHeightRange,
  forecast: Forecast
): boolean => {
  return forecast.wave.max >= preferredWave.min;
};

export const matchByDayHour = (
  preferredHours: number[],
  forecast: Forecast
): boolean => {
  const date = dayjs.unix(forecast.timestamp);
  const hour = date.hour();
  const lateHour = Math.max(...preferredHours);
  const earlyHour = Math.min(...preferredHours);
  return hour >= earlyHour && hour <= lateHour;
};

export const matchUnseenForecasts = async (
  forecasts: Forecast[],
  chatId: number,
  spotId: string
) => {
  const enrichForecasts = await Promise.all(
    forecasts.map(async (forecast) => {
      const hasSeen = await seenForecastModel.findOne({
        chatId,
        spotId,
        timestamp: normalizeTimestamp(forecast.timestamp),
      });
      return {
        ...forecast,
        unseen: hasSeen === null,
      };
    })
  );
  return enrichForecasts.filter((forecast) => forecast.unseen);
};

export const matchForecastsByUserPreferences = async (
  userPreference: IUserNotificationSettingsSchema,
  forecasts: Forecast[]
) => {
  if (!forecasts || !userPreference) {
    logger.error(
      `Invalid parameters forecasts: ${forecasts}, userPreference: ${userPreference}`
    );
    throw new Error("Invalid parameters");
  }
  logger.debug(`forecast: ${forecasts}`);
  logger.debug(`user preference: ${userPreference}`);

  const unseenForecast = await matchUnseenForecasts(
    forecasts,
    userPreference.chatId,
    userPreference.spot.spotId
  );
  logger.debug(`unseen forecast: ${unseenForecast.length}`);

  const waveMatches = unseenForecast.filter((forecast) =>
    matchByWaveHeight(userPreference.waveHeightRange, forecast)
  );
  logger.debug(`wave matches: ${waveMatches.length}`);

  const ratingMatches = unseenForecast.filter((forecast) =>
    matchByRating(userPreference.rating, forecast)
  );
  logger.debug(`rating matches: ${ratingMatches.length}`);
  const matches = [...waveMatches, ...ratingMatches].filter((forecast) =>
    matchByDayHour(userPreference.preferredReminderHours, forecast)
  );
  logger.debug(`Total matches: ${matches.length}`);

  const uniqueMatches = [
    ...new Map(matches.map((item) => [item["timestamp"], item])).values(),
  ];
  return uniqueMatches;
};

export const checkMatchBetweenForecastAndUserSettings = async (
  chatId: number
): Promise<Forecast[]> => {
  const userPreferredSettings = await UserNotificationSettingsModel.findOne({
    chatId,
  });
  const forecast = await getForecast(userPreferredSettings.spot.spotId);
  const matches = await matchForecastsByUserPreferences(
    userPreferredSettings,
    forecast
  );
  return matches;
};
