import TelegramBot from "node-telegram-bot-api";
import { SpotLocation } from "../location/location.types";
import { ChatAction } from "./types";

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

export const senLocationWithDetails = async (
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

export const senLocationWithDetailsWithoutReply = async (
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
