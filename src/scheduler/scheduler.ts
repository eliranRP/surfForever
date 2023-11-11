import Agenda from "agenda";
import logger from "../framework/logger.manager";
import UserNotificationSettingsCrudModel from "../api/users/user-notifications-settings.model";
import { checkMatchBetweenForecastAndUserSettings } from "../api/user-filters/user-filters";
import { sendPreferredSpot } from "../api/users/utils";
import TelegramBotManager from "../framework/bot-manager";
import { MESSAGES_TYPE } from "../api/messages/message.type";

const connection = process.env.MONGODB_URL || "mongodb://127.0.0.1/surfforever";
export const agenda = new Agenda({
  db: { address: connection, collection: "schedulers" },
});

const instance = TelegramBotManager.getInstance();

export const SCHEDULE_NOTIFIER = "schedule_notifier";

export const scheduleNotifier = async () => {
  logger.info("initializing scheduleNotifier");
  try {
    const result = await agenda.every("0 16 * * *", SCHEDULE_NOTIFIER);
    return result;
  } catch (error) {
    logger.error(`Failed to initialize scheduleNotifier error: ${error}`);
  }
};

agenda.define(SCHEDULE_NOTIFIER, async (job) => {
  logger.info("running scheduleNotifier");
  const usersSettings = await UserNotificationSettingsCrudModel.findMany({});
  logger.info(`notifier run on ${usersSettings.length} users`);
  await Promise.all(
    usersSettings.map(async (settings) => {
      const hasMatches = await checkMatchBetweenForecastAndUserSettings(
        settings.chatId
      );
      if (hasMatches) {
        logger.info(`has match!  settings: ${settings}`);
        await sendPreferredSpot(settings.chatId, settings.spot, instance);

        await instance.sendMessage(settings.chatId, MESSAGES_TYPE.MATCH);
        return;
      }
      logger.info(`No match!  settings: ${settings} `);
    })
  );
  logger.info("finish running scheduleNotifier");
});
