import TelegramBot from 'node-telegram-bot-api';

const token = process.env.API_KEY;


class TelegramBotManager {
    private static instance: TelegramBot;


    private constructor() {

    }

    public static getInstance(): TelegramBot {
        if (!TelegramBotManager.instance) {
            TelegramBotManager.instance = new TelegramBot(token, { polling: true });
        }
        return TelegramBotManager.instance;
    }
}

export default TelegramBotManager;
