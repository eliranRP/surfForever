import { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";
import TelegramBotManager from "../../framework/bot-manager";
import UserNotificationSettingsCrudModel from "./user-notifications-settings.model";
import { searchSpotByName } from "../location/location.service";
import logger from "../../framework/logger.manager";
import {
  ChatAction,
  Rating,
  RatingDisplayName,
  WaveHeightResponseButton,
  SurfingLocationResponseButton,
  WaveConfiguration,
  RatingResponseButton,
  Hours,
  HoursResponseButton,
} from "./types";
import { chooseSpotMessage, getPreferredSpot } from "./utils";
import { MESSAGES_TYPE } from "../messages/message.type";
import { chunkArray } from "../utils/utils";
import { checkMatchBetweenForecastAndUserSettings } from "../user-filters/user-filters";

const instance = TelegramBotManager.getInstance();

instance.onText(/\/test/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const matches = await checkMatchBetweenForecastAndUserSettings(chatId);
  const message = matches ? "Is a match!" : "No match!";
  await instance.sendMessage(chatId, message);
});

instance.onText(/\/settings/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const settings = await UserNotificationSettingsCrudModel.findOne({ chatId });
  await instance.sendMessage(chatId, JSON.stringify(settings, null, 2));
});

instance.onText(/\/location/, async (msg: Message) => {
  const chatId = msg.chat.id;
  try {
    const query = msg.text.replace(/\/location/, "").trim();
    const locationSuggestions = await searchSpotByName(query);
    await Promise.all(
      locationSuggestions.map(async (location) =>
        chooseSpotMessage(chatId, location, instance)
      )
    );
  } catch (error) {
    await instance.sendMessage(chatId, error.message);
    logger.error(error);
  }
});

instance.onText(/\/rating/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const options = [];
  for (const ratingKey in RatingDisplayName) {
    const keyItem = {
      text: RatingDisplayName[ratingKey],
      callback_data: JSON.stringify({
        type: ChatAction.SET_RATING,
        data: Rating[ratingKey],
      }),
    };
    options.push(keyItem);
  }

  // Create the inline keyboard markup
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: chunkArray(options, 2),
  };

  await instance.sendMessage(
    chatId,
    "Please select rating to be notified on:",
    { reply_markup: replyMarkup }
  );
});

instance.onText(/\/wave/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const options = WaveConfiguration.map((option) => {
    return {
      text: `${option.height.min}m - ${option.height.max}m`,
      callback_data: JSON.stringify({
        type: ChatAction.SET_WAVE_HEIGHT,
        data: option.id,
      }),
    };
  });

  // Create the inline keyboard markup
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: chunkArray(options, 2),
  };

  await instance.sendMessage(
    chatId,
    "Please select wave height to be notified on:",
    { reply_markup: replyMarkup }
  );
});

instance.onText(/\/hours/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const options = Hours.map((option) => {
    return {
      text: `${option.display} (${Math.min(...option.values)}:00 - ${Math.max(
        ...option.values
      )}:00)  ${option.emoji}`,
      callback_data: JSON.stringify({
        type: ChatAction.SET_PREFERRED_HOURS,
        data: option.key,
      }),
    };
  });

  // Create the inline keyboard markup
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: chunkArray(options, 1),
  };

  await instance.sendMessage(
    chatId,
    "Please select preferred hours to be notified on:",
    { reply_markup: replyMarkup }
  );
});

instance.onText(/\/daysToForecast/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const namePrompt = await instance.sendMessage(
    chatId,
    "Select the number of days in advance you'd like to forecast, with an option to look up to 5 days ahead ⏰⏰⏰",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  instance.onReplyToMessage(chatId, namePrompt.message_id, async (nameMsg) => {
    try {
      const input = Number(nameMsg.text);
      if (typeof input === "number" && input >= 1 && input <= 5) {
        await UserNotificationSettingsCrudModel.upsert(
          { chatId },
          { daysToForecast: input }
        );
        await instance.sendMessage(
          chatId,
          `We are currently forecasting up to ${input} days ahead.`
        );
      } else {
        await instance.sendMessage(
          chatId,
          `Something wrong with your input, please type a number between 1-5`
        );
      }
    } catch (error) {
      await instance.sendMessage(
        chatId,
        `Something wrong with your input, please type a number between 1-5`
      );
    }
  });
});

instance.onText(/\/favorite/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const settings = await UserNotificationSettingsCrudModel.findOne({ chatId });

  await getPreferredSpot(chatId, settings.spot, instance);
});

// Handle inline keyboard button callbacks
instance.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  try {
    const messageId = query.message.message_id;
    const data = JSON.parse(query.data);
    switch (data.type) {
      case ChatAction.SET_RATING:
        const ratingKey = (data as RatingResponseButton).data;
        await UserNotificationSettingsCrudModel.setPreferredRating(
          chatId,
          ratingKey
        );
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.RATING_EMOJI}`);
        break;
      case ChatAction.SET_WAVE_HEIGHT:
        const waveKey = (data as WaveHeightResponseButton).data;
        await UserNotificationSettingsCrudModel.setPreferredWavHeight(
          chatId,
          waveKey
        );
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.WAVE_EMOJI}`);
        break;
      case ChatAction.SET_DAYS_TO_FORECAST:
      case ChatAction.SET_PREFERRED_HOURS:
        const hoursKey = (data as HoursResponseButton).data;
        await UserNotificationSettingsCrudModel.setPreferredHours(
          chatId,
          hoursKey
        );
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.HOURS_EMOJI}`);
        break;
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
