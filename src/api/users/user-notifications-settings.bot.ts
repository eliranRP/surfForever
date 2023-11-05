import { Message } from "node-telegram-bot-api";
import TelegramBotManager from "../../framework/bot-manager";
import { WaveConfiguration, WaveConfigurationType } from "./const";
import UserNotificationSettingsCrudModel from "./user-notifications-settings.model";

const instance = TelegramBotManager.getInstance();

interface ResponseButton {
  type: ChatAction;
  data: WaveConfigurationType;
}

enum ChatAction {
  SET_WAVE_HEIGHT = "set_wave_height",
  SET_LOCATION = "set_location",
  SET_DAYS_TO_FORECAST = "set_days_to_forecast",
  SET_PREFERRED_REMINDER_HOURS = "set_preferred_reminder_hours",
}

instance.onText(/\/location/, async (msg: Message) => {
  const chatId = msg.chat.id;
  await instance.sendMessage(chatId, "Upcoming");
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

instance.onText(/\/beach/, async (msg: Message) => {
  const chatId = msg.chat.id;
  await instance.sendMessage(chatId, "Upcoming");
});

instance.onText(/\/settings/, async (msg: Message) => {
  const chatId = msg.chat.id;
  await instance.sendMessage(chatId, "Upcoming");
});

// Handle inline keyboard button callbacks
instance.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  try {
    const messageId = query.message.message_id;
    const data = JSON.parse(query.data);
    switch (data.type) {
      case ChatAction.SET_WAVE_HEIGHT:
        const waveKey = data.data;
        UserNotificationSettingsCrudModel.setPreferredWavHeight(
          chatId,
          waveKey
        );
        break;
      case ChatAction.SET_DAYS_TO_FORECAST:
      case ChatAction.SET_PREFERRED_REMINDER_HOURS:
      case ChatAction.SET_LOCATION:
    }
  } catch (error) {
    console.log(error);
  }
});
