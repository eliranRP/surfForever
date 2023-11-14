import { InlineKeyboardMarkup, Message } from "node-telegram-bot-api";
import TelegramBotManager from "../../framework/bot-manager";
import UserNotificationSettingsModel from "./user-notifications-settings.model";
import { searchSpotByName } from "../location/location.service";
import logger from "../../framework/logger.manager";
import {
  ChatAction,
  WaveHeightResponseButton,
  SurfingLocationResponseButton,
  WaveConfiguration,
  RatingResponseButton,
  Hours,
  HoursResponseButton,
  RatingKind,
  NotificationOptions,
  NotificationResponseButton,
} from "./types";
import {
  chooseSpotMessage,
  sanitizeLocationArea,
  sendPreferredSpot,
} from "./utils";
import {
  MESSAGES_TYPE,
  getPreferredSettingMessage,
} from "../messages/message.type";
import { chunkArray } from "../utils/utils";
import { checkMatchBetweenForecastAndUserSettings } from "../user-filters/user-filters";

const instance = TelegramBotManager.getInstance();

instance.onText(/\/test/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const matches = await checkMatchBetweenForecastAndUserSettings(chatId);
  const message = matches ? "Is a match!" : "No match!";
  await instance.sendMessage(chatId, message);
});

instance.onText(/\/help/, async (msg: Message) => {
  const chatId = msg.chat.id;
  await instance.sendMessage(chatId, MESSAGES_TYPE.HELP);
});

instance.onText(/\/settings/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const settings = await UserNotificationSettingsModel.findOne({ chatId });
  if (settings) {
    return await instance.sendMessage(
      chatId,
      getPreferredSettingMessage(settings),
      {
        parse_mode: "HTML",
      }
    );
  }

  return await instance.sendMessage(chatId, MESSAGES_TYPE.NO_SETTINGS);
});
instance.onText(/\/daysforecast/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const message = await instance.sendMessage(
    chatId,
    "Select the number of days in advance you'd like to forecast, with an option to look up to 5 days ahead ⏰⏰⏰",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  instance.onReplyToMessage(chatId, message.message_id, async (nameMsg) => {
    try {
      const input = Number(nameMsg.text);
      if (typeof input === "number" && input >= 1 && input <= 5) {
        await UserNotificationSettingsModel.upsert(
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

instance.onText(/\/location/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const message = await instance.sendMessage(
    chatId,
    "Type location spot name. Example: Maaravi",
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Spot name",
      },
    }
  );

  instance.onReplyToMessage(chatId, message.message_id, async (nameMsg) => {
    try {
      const query = nameMsg.text;
      const locationName = sanitizeLocationArea(query);
      if (!locationName) throw new Error("Invalid location name");
      const locationSuggestions = await searchSpotByName(locationName);
      for (const location of locationSuggestions) {
        await chooseSpotMessage(chatId, location, instance);
      }
    } catch (error) {
      await instance.sendMessage(chatId, error.message);
      logger.error(error);
    }
  });
});

instance.onText(/\/rating/, async (msg: Message) => {
  const chatId = msg.chat.id;

  const options = RatingKind.map((option) => {
    return {
      text: option.display,
      callback_data: JSON.stringify({
        type: ChatAction.SET_RATING,
        data: option.key,
      }),
    };
  });

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

instance.onText(/\/notifications/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const options = NotificationOptions.map((option) => {
    return {
      text: `${option.display} ${option.emoji}`,
      callback_data: JSON.stringify({
        type: ChatAction.SET_NOTIFICATION_TURNED_ON,
        data: option.key,
      }),
    };
  });

  // Create the inline keyboard markup
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: chunkArray(options, 1),
  };

  await instance.sendMessage(chatId, "Please turn On / Off notifications:", {
    reply_markup: replyMarkup,
  });
});

instance.onText(/\/favorite/, async (msg: Message) => {
  const chatId = msg.chat.id;
  const settings = await UserNotificationSettingsModel.findOne({ chatId });
  if (settings?.spot) {
    await sendPreferredSpot(chatId, settings.spot, instance);
    return;
  }
  await instance.sendMessage(
    chatId,
    "You should choose location, long press on /location and type with the command the name of your favorite spot"
  );
});

// Handle inline keyboard button callbacks
instance.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  try {
    const data = JSON.parse(query.data);
    switch (data.type) {
      case ChatAction.SET_RATING:
        const ratingKey = (data as RatingResponseButton).data;
        await UserNotificationSettingsModel.setPreferredRating(
          chatId,
          ratingKey
        );
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.RATING_EMOJI}`);
        break;
      case ChatAction.SET_WAVE_HEIGHT:
        const waveKey = (data as WaveHeightResponseButton).data;
        await UserNotificationSettingsModel.setPreferredWavHeight(
          chatId,
          waveKey
        );
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.WAVE_EMOJI}`);
        break;
      case ChatAction.SET_NOTIFICATION_TURNED_ON:
        const notificationResponse = (data as NotificationResponseButton).data;
        await UserNotificationSettingsModel.setPreferredNotification(
          chatId,
          notificationResponse
        );
        await instance.sendMessage(
          chatId,
          `${MESSAGES_TYPE.NOTIFICATIONS_EMOJI}`
        );

        break;
      case ChatAction.SET_PREFERRED_HOURS:
        const hoursKey = (data as HoursResponseButton).data;
        await UserNotificationSettingsModel.setPreferredHours(chatId, hoursKey);
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.HOURS_EMOJI}`);
        break;
      case ChatAction.CHOOSE_SURFING_LOCATION:
        logger.info(JSON.stringify(data as SurfingLocationResponseButton));
        await UserNotificationSettingsModel.setPreferredLocation(
          chatId,
          data.id
        );
        await instance.sendMessage(chatId, `${MESSAGES_TYPE.LOCATION_EMOJI}`);
        break;
    }
  } catch (error) {
    logger.error(error);
  }
});
