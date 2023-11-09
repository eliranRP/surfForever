import TelegramBot from "node-telegram-bot-api";
import { SpotLocation } from "../location/location.types";
import { ChatAction, Rating, WaveConfiguration, WaveTypeId } from "./types";
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

export const getPreferredSpot = async (
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
  return {
    key: ratingKey,
    value: Rating[ratingKey],
  };
};

export const getRatingByValue = (ratingValue: Rating): RatingSchema => {
  const t = ratingValue.valueOf();
  return {
    key: Rating[ratingValue] as keyof typeof Rating,
    value: ratingValue,
  };
};


