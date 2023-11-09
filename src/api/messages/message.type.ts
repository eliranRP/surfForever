import { SpotLocation } from "../location/location.types";
import { HourType } from "../users/types";
import {
  IUserNotificationSettings,
  RatingSchema,
  WaveHeightRange,
} from "../users/user-notifications-settings.schema";
import { getHourByKind } from "../users/utils";

const help = `
For start you should use those command to set your preferences. You can set them all or set only the spot you preferred.
By default you will receive a notification when the wave heights are above 0.8m or the rating is Fair.

wave: /wave this command let you set the wave height you want to be notified.
rating: /rating this command open an options to notify by Surfline rating. 
hours: /hours this command let you the option to set which forecast hours the notifier will look on.
location: /location command. You can type a beach, city, country. For example /location maaravi
Days forecast: /daysforecast this command help you to set how many days ahead you will be notifying.
Favorite spot: /favorite this command send you the current favorite spot.
settings: /settings To get your current preferences.
`;

export const MESSAGES_TYPE = {
  LOCATION_EMOJI:
    "Great  🏖️🏖️🏖️🏖️🏖️, you will receive a notification on the spot you chosen",
  WAVE_EMOJI:
    "Great  🌊🌊🌊🌊, you will receive a notification when the wave heights are in the range you chose",
  RATING_EMOJI:
    "Great  ⭐⭐⭐⭐⭐, you will receive a notification when the rating is in the range you chose",
  HOURS_EMOJI:
    "Great  🏄🏄‍♀️🏄🏄‍♀️, you will receive a notification when we find a forecast that suite your preferences and the hours is in the range you chose",
  HELP: help,
  MATCH: `⭐⭐⭐⭐⭐ Yaa we found a match be ready to go! 🏄‍♀️🏄‍♀️🏄‍♀️ You can follow the link to see full forecast`,
  NO_SETTINGS:
    "You don't have any settings yet. Use /help to see your options.",
};

export const getHourMessage = (option: HourType) => {
  return option
    ? `${option.display} (${Math.min(...option.values)}:00 - ${Math.max(
        ...option.values
      )}:00)  ${option.emoji}`
    : "No hours selected";
};

export const getPreferredSettingMessage = (
  settings: IUserNotificationSettings
) => {
  if (!settings) return;
  const hours = getHourByKind(settings.preferredReminderHours);

  return `
  The notifier is set to:

  <a><b>Watch</b></a>:  🏄 ${settings?.daysToForecast} days ahead. 🏄


  <a><b>Hours</b></a>: ⏰ ${getHourMessage(hours)}  ⏰


  <a><b>Rating</b></a>: ⭐  ${ratingMessage(settings.rating)}  ⭐


  <a><b>Wave Height</b></a>: 🌊 ${waveMessage(settings.waveHeightRange)} 🌊


  <a><b>Location</b></a>:  🏖️ ${spotMessage(settings.spot)} 🏖️


  You can click on the /help command to see your options.
  `;
};

const waveMessage = (waveHeightRange: WaveHeightRange) => {
  return waveHeightRange
    ? `${waveHeightRange.min}m - ${waveHeightRange.max}m`
    : "No wave height selected";
};

const ratingMessage = (rating: RatingSchema) => {
  return rating?.display ? rating?.display : "No rating selected";
};

const spotMessage = (spot: SpotLocation) => {
  return spot
    ? `${spot.name} - ${spot.breadCrumbs.join()} 
    <a>You can click on the link to see the spot forecast: ${spot.href} </a>`
    : "No spot selected";
};
