import TelegramBot from 'node-telegram-bot-api';

class TelegramBotManager {
  private static instance: TelegramBot;

  private constructor() {}

  public static getInstance(token: string = process.env.API_KEY): TelegramBot {
    if (!TelegramBotManager.instance) {
      TelegramBotManager.instance = new TelegramBot(token, { polling: true });
    }
    return TelegramBotManager.instance;
  }
}

export default TelegramBotManager;
