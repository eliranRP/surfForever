require("dotenv").config();

import { MongoManager } from "./database/mongoose-manager";
import TelegramBotManager from "./framework/bot-manager";
import "./framework/logger.manager";
import "./api/users/user-notifications-settings.bot";

(async () => {
  await MongoManager.connect();
  // if (process.env.NODE_ENV == "production") {
  //     const user = await UserCrudModel.findOne({ phoneNumber: "0547919327" });
  //     if (user?.chatId) {
  //         TelegramBotManager.getInstance().sendMessage(user?.chatId, `There server was restarted`);
  //     }
  // }
})();
