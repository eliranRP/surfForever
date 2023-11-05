import { Message } from "node-telegram-bot-api";
import TelegramBotManager from "../../framework/bot-manager";
import { WaveConfiguration } from "./const";
import UserNotificationSettingsCrudModel from "./user-notifications-settings.model";
import { locationByName } from "../location/location.service";
import logger from "../../framework/logger.manager";
import {
  ChatAction,
  ResponseButton,
  SurfingLocationResponseButton,
} from "./types";
import {
  senLocationWithDetails,
  senLocationWithDetailsWithoutReply,
} from "./utils";

const instance = TelegramBotManager.getInstance();

instance.onText(/\/location/, async (msg: Message) => {
  const chatId = msg.chat.id;
  try {
    const query = msg.text.replace(/\/location/, "").trim();
    const locationSuggestions = await locationByName(query);
    await Promise.all(
      locationSuggestions.map(async (location) =>
        senLocationWithDetails(chatId, location, instance)
      )
    );
  } catch (error) {
    await instance.sendMessage(chatId, error.message);
    logger.error(error);
  }
});

instance.onText(/\/wave/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const options = WaveConfiguration.map((option) => {
    return {
      text: `${option.display} (${option.height.min} - ${option.height.max})`,
      callback_data: JSON.stringify({
        type: ChatAction.SET_WAVE_HEIGHT,
        data: option.id,
      }),
    };
  });

  // Create an inline keyboard with colored buttons
  const keyboard = [options.slice(0, 2), options.slice(2, 4)];

  // Create the inline keyboard markup
  const replyMarkup = {
    inline_keyboard: keyboard,
  };

  await instance.sendMessage(
    chatId,
    "Please select wave height to be notified on:",
    { reply_markup: replyMarkup }
  );
});

instance.onText(/\/favorite/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const settings = await UserNotificationSettingsCrudModel.findOne({ chatId });

  await senLocationWithDetailsWithoutReply(chatId, settings.spot, instance);
});


// Handle inline keyboard button callbacks
instance.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  try {
    const messageId = query.message.message_id;
    const data = JSON.parse(query.data);
    switch (data.type) {
      case ChatAction.SET_WAVE_HEIGHT:
        const waveKey = (data as ResponseButton).data;
        await UserNotificationSettingsCrudModel.setPreferredWavHeight(
          chatId,
          waveKey
        );
        break;
      case ChatAction.SET_DAYS_TO_FORECAST:
      case ChatAction.SET_PREFERRED_REMINDER_HOURS:
      case ChatAction.CHOOSE_SURFING_LOCATION:
        logger.info(JSON.stringify(data as SurfingLocationResponseButton));
        await UserNotificationSettingsCrudModel.setPreferredLocation(
          chatId,
          data.id
        );
        break;
    }
  } catch (error) {
    console.log(error);
  }
});
