require('dotenv').config();

import { MongoManager } from './database/mongoose-manager';
import './framework/logger.manager';
import './api/users/user-notifications-settings.bot';
import { agenda, scheduleNotifier } from './scheduler/scheduler';
import logger from './framework/logger.manager';
(async () => {
  logger.info('App starting...');
  await MongoManager.connect();
  await agenda.start();
  await scheduleNotifier();
  logger.info('App running');
})();
