import {
  IUserNotificationSettings,
  IUserNotificationSettingsSchema,
  RatingSchema,
  WaveHeightRange,
} from "../users/user-notifications-settings.schema";
import { Forecast } from "../../surfline/types";
import dayjs from "dayjs";
import UserNotificationSettingsCrudModel from "../users/user-notifications-settings.model";
import { getForecast } from "../../surfline/api";
import logger from "../../framework/logger.manager";

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

export const matchForecastsByUserPreferences = (
  userPreference: IUserNotificationSettingsSchema,
  forecasts: Forecast[]
) => {
  if (!forecasts || !userPreference) {
    logger.error("Invalid parameters", forecasts, userPreference);
    throw new Error("Invalid parameters");
  }
  logger.debug("forecast: ", forecasts);
  logger.debug("user preference: ", userPreference);
  
  const waveMatches = forecasts.filter((forecast) =>
    matchByWaveHeight(userPreference.waveHeightRange, forecast)
  );
  logger.debug("wave matches: ", waveMatches);

  const ratingMatches = forecasts.filter((forecast) =>
    matchByRating(userPreference.rating, forecast)
  );
  logger.debug("rating matches: ", ratingMatches);
  const matches = [...waveMatches, ...ratingMatches].filter((forecast) =>
    matchByDayHour(userPreference.preferredReminderHours, forecast)
  );
  logger.debug("Total matches: ", matches);
  return matches;
};

export const checkMatchBetweenForecastAndUserSettings = async (
  chatId: number
) => {
  const userPreferredSettings = await UserNotificationSettingsCrudModel.findOne(
    { chatId }
  );
  const forecast = await getForecast(userPreferredSettings.spot.spotId);
  const matches = matchForecastsByUserPreferences(
    userPreferredSettings,
    forecast
  );
  return matches.length > 0;
};