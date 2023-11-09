import TelegramBot from "node-telegram-bot-api";
import { SpotLocation } from "../location/location.types";
import {
  ChatAction,
  Hours,
  Rating,
  RatingKind,
  WaveConfiguration,
  WaveTypeId,
} from "./types";
import { RatingSchema } from "./user-notifications-settings.schema";

export const createLocationMessage = (location: SpotLocation) => {
  const message = `
    ${location.name} - ${location.breadCrumbs.join()}
    ${location.href}`;

  const locationResponseMessage = {
    text: "Select",
    callback_data: JSON.stringify({
      type: ChatAction.CHOOSE_SURFING_LOCATION,
      id: location.spotId,
    }),
  };

  const replyMarkup = {
    inline_keyboard: [[locationResponseMessage]],
  };
  return { replyMarkup, message };
};

export const chooseSpotMessage = async (
  chatId: number,
  location: SpotLocation,
  instance: TelegramBot
) => {
  await instance.sendLocation(
    chatId,
    location.point.coordinates[1],
    location.point.coordinates[0]
  );
  const markupMessage = createLocationMessage(location);
  await instance.sendMessage(chatId, markupMessage.message, {
    reply_markup: markupMessage.replyMarkup,
  });
};

export const sendPreferredSpot = async (
  chatId: number,
  location: SpotLocation,
  instance: TelegramBot
) => {
  await instance.sendLocation(
    chatId,
    location.point.coordinates[1],
    location.point.coordinates[0]
  );
  const markupMessage = createLocationMessage(location);
  await instance.sendMessage(chatId, markupMessage.message);
};

export const findWaveConfigurationTypeById = (type: WaveTypeId) => {
  const result = WaveConfiguration.find((item) => item.id === type);
  if (!result) throw new Error("Invalid wave height");
  return result;
};

export const getRatingByKey = (
  ratingKey: keyof typeof Rating
): RatingSchema => {
  return RatingKind.find((item) => item.key === ratingKey);
};

export const getRatingByValue = (ratingValue: Rating): RatingSchema => {
  return RatingKind.find((item) => item.value === ratingValue);
};

export const getHourByKind = (option: number[]) => {
  const match = Hours.filter((item) => item.values[0] === option[0]);
  if (match.length > 0) {
    return match[0];
  }
};
