import TelegramBotManager from '../../../framework/bot-manager';
import * as api from '../../../surfline/api';
import { ForecastFactory } from '../../user-filters/test/user-filter.factory';
import { MORNING, NotificationKind, Rating, WaveTypeId } from '../types';
import UserNotificationSettingsModel from '../user-notifications-settings.model';
import { findWaveConfigurationTypeById, getRatingByKey, getRatingByValue } from '../utils';
import { UserNotificationSettingsFactory } from './user-notification-settings.factory';
import TelegramBot from 'node-telegram-bot-api';
import SeenForecastModel from '../../user-filters/seen-forecast.model';
import dayjs from 'dayjs';

// Mock the TelegramBot class with a custom implementation
jest.mock('node-telegram-bot-api');

describe('User Notification Settings', () => {
  describe('set proffered notification settings', () => {
    test('should set proffered notification settings to off', async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        hasNotificationTurnedOn: true,
        chatId,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //act
      await UserNotificationSettingsModel.setPreferredNotification(chatId, NotificationKind.NO);

      //assert
      const result = await UserNotificationSettingsModel.findOne({
        chatId,
      });

      expect(result?.hasNotificationTurnedOn).toBe(false);
    });
    test('should set proffered notification settings to on', async () => {
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        hasNotificationTurnedOn: false,
        chatId,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //act
      await UserNotificationSettingsModel.setPreferredNotification(chatId, NotificationKind.YES);

      //assert
      const result = await UserNotificationSettingsModel.findOne({
        chatId,
      });

      expect(result?.hasNotificationTurnedOn).toBe(true);
    });
  });
  describe('setPreferredWavHeight', () => {
    test('should set wave height for specific chat', async () => {
      //arrange
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //act
      const chatId = 2;
      await UserNotificationSettingsModel.setPreferredWavHeight(chatId, WaveTypeId.FAIR);

      //assert
      const result = await UserNotificationSettingsModel.findOne({
        chatId,
      });
      const selectedWaveHight = findWaveConfigurationTypeById(WaveTypeId.FAIR);
      expect(result?.waveHeightRange.max).toBe(selectedWaveHight.height.max);
      expect(result?.waveHeightRange.min).toBe(selectedWaveHight.height.min);
      expect(result?.chatId).toBe(chatId);
    });

    test('should update wave height for specific chat', async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: findWaveConfigurationTypeById(WaveTypeId.POOR).height,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //act
      await UserNotificationSettingsModel.setPreferredWavHeight(chatId, WaveTypeId.POOR);

      //assert
      const result = await UserNotificationSettingsModel.findOne({
        chatId,
      });

      const selectedWaveHight = findWaveConfigurationTypeById(WaveTypeId.POOR);
      expect(result?.waveHeightRange.max).toBe(selectedWaveHight.height.max);
      expect(result?.waveHeightRange.min).toBe(selectedWaveHight.height.min);
      expect(result?.chatId).toBe(chatId);
    });
    test('should failed updating wave height when wave height is invalid', async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: findWaveConfigurationTypeById(WaveTypeId.POOR).height,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //assert
      expect(
        async () =>
          await UserNotificationSettingsModel.setPreferredWavHeight(
            chatId,
            'invalid_wave_height' as any,
          ),
      ).rejects.toThrow('Invalid wave height');
    });
  });

  describe('set preferred rating', () => {
    test('should set rating for specific chat', async () => {
      //arrange
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
      });
      delete userNotificationSettings.rating;
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //act
      const chatId = 2;
      const selectedRating = getRatingByValue(Rating.GOOD).key;
      await UserNotificationSettingsModel.setPreferredRating(chatId, selectedRating);

      //assert
      const result = await UserNotificationSettingsModel.findOne({
        chatId,
      });
      expect(result?.rating.key).toMatch(selectedRating);
      expect(result?.chatId).toBe(chatId);
    });

    test('should update rating for specific chat', async () => {
      //arrange
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
        rating: getRatingByValue(Rating.POOR),
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //act
      const chatId = 2;
      const selectedRating = getRatingByValue(Rating.GOOD).key;
      await UserNotificationSettingsModel.setPreferredRating(chatId, selectedRating);

      //assert
      const result = await UserNotificationSettingsModel.findOne({
        chatId,
      });
      expect(result?.rating.key).toMatch(selectedRating);
      expect(result?.chatId).toBe(chatId);
    });

    test('should failed updating rating when rating is invalid', async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: findWaveConfigurationTypeById(WaveTypeId.POOR).height,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      //assert
      expect(
        async () =>
          await UserNotificationSettingsModel.setPreferredRating(chatId, 'invalid_rating' as any),
      ).rejects.toThrow('Invalid rating');
    });
  });

  describe('Notify user', () => {
    test('should notify user when there is unseen matches', async () => {
      //Arrange
      const chatId = 1;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        preferredReminderHours: MORNING,
        rating: {
          key: getRatingByKey('FAIR').key,
          value: getRatingByValue(Rating.FAIR).value,
          display: 'FAIR',
        },
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      const forecastTimestamp = dayjs('2023-11-08T09:00:00').unix();
      const forecasts = ForecastFactory.buildList(2, {
        timestamp: forecastTimestamp,
        rating: {
          key: getRatingByKey('FAIR').key,
          value: getRatingByValue(Rating.FAIR).value,
        },
      });
      jest.spyOn(api, 'getForecast').mockResolvedValue(forecasts);
      const mockedTelegramBotInstance = new TelegramBot('mocked-token', {
        polling: true,
      });
      // Mock the implementation of the getInstance method
      TelegramBotManager.getInstance = jest.fn().mockReturnValue(mockedTelegramBotInstance);

      //Act
      await UserNotificationSettingsModel.notifyUsers([userNotificationSettings]);

      // Assert
      expect(mockedTelegramBotInstance.sendMessage).toHaveBeenCalledTimes(2);
      expect(mockedTelegramBotInstance.sendLocation).toHaveBeenCalledTimes(1);
      const seenForecast = await SeenForecastModel.findMany({});
      expect(seenForecast.length).toBe(1);
    });

    test('Should not notify user when no matches', async () => {
      //Arrange
      const chatId = 1;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        preferredReminderHours: MORNING,
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      const forecastTimestamp = dayjs('2023-11-08T20:00:00').unix();
      const forecasts = ForecastFactory.buildList(2, {
        timestamp: forecastTimestamp,
      });
      jest.spyOn(api, 'getForecast').mockResolvedValue(forecasts);
      const mockedTelegramBotInstance = new TelegramBot('mocked-token', {
        polling: true,
      });
      // Mock the implementation of the getInstance method
      TelegramBotManager.getInstance = jest.fn().mockReturnValue(mockedTelegramBotInstance);

      //Act
      await UserNotificationSettingsModel.notifyUsers([userNotificationSettings]);

      // Assert
      expect(mockedTelegramBotInstance.sendMessage).toHaveBeenCalledTimes(0);
      expect(mockedTelegramBotInstance.sendLocation).toHaveBeenCalledTimes(0);
      const seenForecast = await SeenForecastModel.findMany({});
      expect(seenForecast.length).toBe(0);
    });
    test('Should not notify user when there is seen matches', async () => {
      //Arrange
      const chatId = 1;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        preferredReminderHours: MORNING,
        waveHeightRange: {
          min: 0,
          max: 0,
        },
        rating: {
          key: getRatingByKey('FAIR').key,
          value: getRatingByValue(Rating.FAIR).value,
          display: 'FAIR',
        },
      });
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      const forecastTimestamp = dayjs('2023-11-08T09:00:00').unix();
      const forecasts = ForecastFactory.buildList(2, {
        timestamp: forecastTimestamp,
        wave: {
          min: 1,
          max: 2,
        },
        rating: {
          key: getRatingByKey('FAIR').key,
          value: getRatingByValue(Rating.FAIR).value,
        },
      });

      await SeenForecastModel.setSeenForecast(
        forecasts,
        chatId,
        userNotificationSettings.spot.spotId,
      );
      jest.spyOn(api, 'getForecast').mockResolvedValue(forecasts);
      const mockedTelegramBotInstance = new TelegramBot('mocked-token', {
        polling: true,
      });
      // Mock the implementation of the getInstance method
      TelegramBotManager.getInstance = jest.fn().mockReturnValue(mockedTelegramBotInstance);

      //Act
      await UserNotificationSettingsModel.notifyUsers([userNotificationSettings]);

      // Assert
      expect(mockedTelegramBotInstance.sendMessage).toHaveBeenCalledTimes(0);
      expect(mockedTelegramBotInstance.sendLocation).toHaveBeenCalledTimes(0);
      const seenForecast = await SeenForecastModel.findMany({});
      expect(seenForecast.length).toBe(1);
    });
  });
});
