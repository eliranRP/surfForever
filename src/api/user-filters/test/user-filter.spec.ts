import dayjs from "dayjs";
import { AFTERNOON, MORNING, Rating } from "../../users/types";
import {
  checkMatchBetweenForecastAndUserSettings,
  matchByDayHour as matchByHourDay,
  matchByRating,
  matchByWaveHeight,
} from "../user-filters";
import { ForecastFactory, WaveFactory } from "./user-filter.factory";
import { WaveHeightRange } from "../../users/user-notifications-settings.schema";
import { RatingResponse, WaveHeightResponse } from "../../../surfline/types";
import { getRatingByKey, getRatingByValue } from "../../users/utils";
import * as api from "../../../surfline/api";
import UserNotificationSettingsCrudModel from "../../users/user-notifications-settings.model";
import { UserNotificationSettingsFactory } from "../../users/test/user-notification-settings.factory";

describe("user filter", () => {
  describe("match by hour day", () => {
    test("should match the forecast date hour is in the morning between 6-12", () => {
      // Arrange
      const forecastTimestamp = dayjs("2023-11-08T09:00:00").unix();
      const forecast = ForecastFactory.build({ timestamp: forecastTimestamp });
      const preferredTimestamp = MORNING;

      //Act
      const isMatch = matchByHourDay(preferredTimestamp, forecast);
      // Assert
      expect(isMatch).toBeTruthy();
    });

    test("should validate when no match in preferred hours", () => {
      // Arrange
      const forecastTimestamp = dayjs("2023-11-08T09:00:00").unix();
      const forecast = ForecastFactory.build({ timestamp: forecastTimestamp });
      const preferredTimestamp = AFTERNOON;

      //Act
      const isMatch = matchByHourDay(preferredTimestamp, forecast);
      // Assert
      expect(isMatch).toBeFalsy();
    });
  });

  describe("match by rating", () => {
    test("should not match the rating if the forecast is less then preferred", () => {
      // Arrange
      const forecast = ForecastFactory.build({
        rating: getRatingByValue(Rating.FAIR),
      });
      const preferredRating = getRatingByValue(Rating.GOOD);
      const isMatch = matchByRating(preferredRating, forecast);
      expect(isMatch).toBeFalsy();
    });

    test("should not match the rating if the forecast is even or better then preferred", () => {
      // Arrange
      const forecast = ForecastFactory.build({
        rating: getRatingByValue(Rating.GOOD),
      });
      const preferredRating = getRatingByValue(Rating.POOR_TO_FAIR);
      const isMatch = matchByRating(preferredRating, forecast);
      expect(isMatch).toBeTruthy();
    });
  });
  describe("match by matchByWaveHeight", () => {
    test("should not match the wave height if the forecast is less then preferred", () => {
      // Arrange
      const forecast = ForecastFactory.build({
        wave: { min: 0, max: 0.3 },
      });
      const preferredWave: WaveHeightRange = {
        min: 0.6,
        max: 1,
      };
      const isMatch = matchByWaveHeight(preferredWave, forecast);
      expect(isMatch).toBeFalsy();
    });

    test("should not match the wave height if the forecast is even or better then preferred", () => {
      // Arrange
      const forecast = ForecastFactory.build({
        wave: { min: 1, max: 2 },
      });
      const preferredWave: WaveHeightRange = {
        min: 0.3,
        max: 0.6,
      };
      const isMatch = matchByWaveHeight(preferredWave, forecast);
      expect(isMatch).toBeTruthy();
    });

    test("should not match the wave height if the forecast is even or better then preferred", () => {
      // Arrange
      const forecast = ForecastFactory.build({
        wave: { min: 1, max: 2 },
      });
      const preferredWave: WaveHeightRange = {
        min: 0.3,
        max: 0.6,
      };
      const isMatch = matchByWaveHeight(preferredWave, forecast);
      expect(isMatch).toBeTruthy();
    });
  });

  describe("user preferred settings check match forecasts", () => {
    test("should find a match by rating", async () => {
      // Arrange
      const forecastTimestampDay = dayjs("2023-11-08T09:00:00").unix();
      const forecastTimestampEvening = dayjs("2023-11-08T18:00:00").unix();

      const RATINGS: RatingResponse = {
        data: {
          rating: [
            {
              timestamp: forecastTimestampEvening,
              utcOffset: 0,
              rating: getRatingByValue(Rating.FAIR),
            },
            {
              timestamp: forecastTimestampDay,
              utcOffset: 0,
              rating: getRatingByValue(Rating.GOOD),
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        wave: [
          WaveFactory.build({ timestamp: forecastTimestampEvening }),
          WaveFactory.build({ timestamp: forecastTimestampDay }),
        ],
      };

      jest.spyOn(api, "getRating").mockResolvedValue(RATINGS);
      jest.spyOn(api, "getWave").mockResolvedValue(WAVE);

      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: {
          min: 0.6,
          max: 1,
        },
        rating: getRatingByValue(Rating.GOOD),
        preferredReminderHours: MORNING,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      // Act
      const result = await checkMatchBetweenForecastAndUserSettings(chatId);

      // Assert
      expect(result).toBeTruthy();
    });
    test("should find a match by wave", async () => {
      // Arrange
      const forecastTimestampDay = dayjs("2023-11-08T09:00:00").unix();
      const forecastTimestampEvening = dayjs("2023-11-08T18:00:00").unix();

      const RATINGS: RatingResponse = {
        data: {
          rating: [
            {
              timestamp: forecastTimestampEvening,
              utcOffset: 0,
              rating: getRatingByValue(Rating.FAIR),
            },
            {
              timestamp: forecastTimestampDay,
              utcOffset: 0,
              rating: getRatingByValue(Rating.FAIR),
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        wave: [
          WaveFactory.build({ timestamp: forecastTimestampEvening }),
          WaveFactory.build({ timestamp: forecastTimestampDay }),
        ],
      };

      jest.spyOn(api, "getRating").mockResolvedValue(RATINGS);
      jest.spyOn(api, "getWave").mockResolvedValue(WAVE);

      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: {
          min: 0.6,
          max: 1,
        },
        rating: getRatingByValue(Rating.GOOD),
        preferredReminderHours: MORNING,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      // Act
      const result = await checkMatchBetweenForecastAndUserSettings(chatId);

      // Assert
      expect(result).toBeTruthy();
    });

    test("should not find a match because preferred day hour is not set to evening", async () => {
      // Arrange
      const forecastTimestampEvening = dayjs("2023-11-08T18:00:00").unix();

      const RATINGS: RatingResponse = {
        data: {
          rating: [
            {
              timestamp: forecastTimestampEvening,
              utcOffset: 0,
              rating: getRatingByValue(Rating.GOOD),
            },
            {
              timestamp: forecastTimestampEvening,
              utcOffset: 0,
              rating: getRatingByValue(Rating.GOOD),
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        wave: [
          WaveFactory.build({ timestamp: forecastTimestampEvening }),
          WaveFactory.build({ timestamp: forecastTimestampEvening }),
        ],
      };

      jest.spyOn(api, "getRating").mockResolvedValue(RATINGS);
      jest.spyOn(api, "getWave").mockResolvedValue(WAVE);

      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: {
          min: 0.6,
          max: 1,
        },
        rating: getRatingByValue(Rating.GOOD),
        preferredReminderHours: MORNING,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      // Act
      const result = await checkMatchBetweenForecastAndUserSettings(chatId);

      // Assert
      expect(result).toBeFalsy();
    });

    test("should not find a match", async () => {
      // Arrange
      const forecastTimestampDay = dayjs("2023-11-08T09:00:00").unix();
      const forecastTimestampEvening = dayjs("2023-11-08T18:00:00").unix();

      const RATINGS: RatingResponse = {
        data: {
          rating: [
            {
              timestamp: forecastTimestampEvening,
              utcOffset: 0,
              rating: getRatingByValue(Rating.FAIR),
            },
            {
              timestamp: forecastTimestampDay,
              utcOffset: 0,
              rating: getRatingByValue(Rating.FAIR),
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        wave: [
          WaveFactory.build({
            timestamp: forecastTimestampEvening,
            surf: {
              min: 0,
              max: 0,
            },
          }),
          WaveFactory.build({
            timestamp: forecastTimestampDay,
            surf: {
              min: 0,
              max: 0,
            },
          }),
        ],
      };

      jest.spyOn(api, "getRating").mockResolvedValue(RATINGS);
      jest.spyOn(api, "getWave").mockResolvedValue(WAVE);

      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: {
          min: 0.6,
          max: 1,
        },
        rating: {
          key: getRatingByKey("GOOD").key,
          value: getRatingByValue(Rating.GOOD).value,
        },
        preferredReminderHours: MORNING,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      // Act
      const result = await checkMatchBetweenForecastAndUserSettings(chatId);

      // Assert
      expect(result).toBeFalsy();
    });
  });
});
