import Agenda from 'agenda';
import logger from '../framework/logger.manager';
import UserNotificationSettingsModel from '../api/users/user-notifications-settings.model';

const connection = process.env.MONGODB_URL || 'mongodb://127.0.0.1/surfforever';
export const agenda = new Agenda({
  db: { address: connection, collection: 'schedulers' },
});

export const SCHEDULE_NOTIFIER = 'schedule_notifier';

export const scheduleNotifier = async () => {
  logger.info('initializing scheduleNotifier');
  try {
    const result = await agenda.every('0 16 * * *', SCHEDULE_NOTIFIER);
    return result;
  } catch (error) {
    logger.error(`Failed to initialize scheduleNotifier error: ${error}`);
  }
};

agenda.define(SCHEDULE_NOTIFIER, async () => {
  logger.info('running scheduleNotifier');
  const usersSettings = await UserNotificationSettingsModel.findMany({
    hasNotificationTurnedOn: true,
  });
  logger.info(`notifier run on ${usersSettings.length} users`);
  await UserNotificationSettingsModel.notifyUsers(usersSettings);
  logger.info('finish running scheduleNotifier');
});
