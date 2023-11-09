import dayjs from "dayjs";
import { AFTERNOON, MORNING, Rating } from "../../users/types";
import {
  checkMatchBetweenForecastAndUserSettings,
  matchByDayHour as matchByHourDay,
  matchByRating,
  matchByWaveHeight,
} from "../user-filters";
import { ForecastFactory } from "./user-filter.factory";
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
        rating: {
          key: Rating[Rating.FAIR] as keyof typeof Rating,
          value: Rating.FAIR,
        },
      });
      const preferredRating = {
        key: Rating[Rating.GOOD] as keyof typeof Rating,
        value: Rating.GOOD,
      };
      const isMatch = matchByRating(preferredRating, forecast);
      expect(isMatch).toBeFalsy();
    });

    test("should not match the rating if the forecast is even or better then preferred", () => {
      // Arrange
      const forecast = ForecastFactory.build({
        rating: {
          key: Rating[Rating.GOOD] as keyof typeof Rating,
          value: Rating.GOOD,
        },
      });
      const preferredRating = {
        key: Rating[Rating.POOR_TO_FAIR] as keyof typeof Rating,
        value: Rating.POOR_TO_FAIR,
      };
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
              rating: {
                key: getRatingByKey("FAIR").key,
                value: getRatingByValue(Rating.FAIR).value,
              },
            },
            {
              timestamp: forecastTimestampDay,
              utcOffset: 0,
              rating: {
                key: getRatingByKey("GOOD").key,
                value: getRatingByValue(Rating.GOOD).value,
              },
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        data: {
          wave: [
            {
              timestamp: forecastTimestampEvening,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 1.2,
                max: 1.8,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.37,
                  max: 1.67,
                },
              },
              power: 734.22422,
            },
            {
              timestamp: forecastTimestampDay,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 0,
                max: 0.3,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.42,
                  max: 1.7,
                },
              },
              power: 794.86928,
            },
          ],
        },
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
              rating: {
                key: getRatingByKey("FAIR").key,
                value: getRatingByValue(Rating.FAIR).value,
              },
            },
            {
              timestamp: forecastTimestampDay,
              utcOffset: 0,
              rating: {
                key: getRatingByKey("FAIR").key,
                value: getRatingByValue(Rating.GOOD).value,
              },
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        data: {
          wave: [
            {
              timestamp: forecastTimestampEvening,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 1.2,
                max: 1.8,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.37,
                  max: 1.67,
                },
              },
              power: 734.22422,
            },
            {
              timestamp: forecastTimestampDay,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 0,
                max: 0.3,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.42,
                  max: 1.7,
                },
              },
              power: 794.86928,
            },
          ],
        },
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
              rating: {
                key: getRatingByKey("GOOD").key,
                value: getRatingByValue(Rating.GOOD).value,
              },
            },
            {
              timestamp: forecastTimestampEvening,
              utcOffset: 0,
              rating: {
                key: getRatingByKey("GOOD").key,
                value: getRatingByValue(Rating.GOOD).value,
              },
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        data: {
          wave: [
            {
              timestamp: forecastTimestampEvening,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 0,
                max: 0,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.37,
                  max: 1.67,
                },
              },
              power: 734.22422,
            },
            {
              timestamp: forecastTimestampEvening,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 0,
                max: 0,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.42,
                  max: 1.7,
                },
              },
              power: 794.86928,
            },
          ],
        },
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
              rating: {
                key: getRatingByKey("FAIR").key,
                value: getRatingByValue(Rating.FAIR).value,
              },
            },
            {
              timestamp: forecastTimestampDay,
              utcOffset: 0,
              rating: {
                key: getRatingByKey("FAIR").key,
                value: getRatingByValue(Rating.FAIR).value,
              },
            },
          ],
        },
      };

      const WAVE: WaveHeightResponse = {
        data: {
          wave: [
            {
              timestamp: forecastTimestampEvening,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 0,
                max: 0,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.37,
                  max: 1.67,
                },
              },
              power: 734.22422,
            },
            {
              timestamp: forecastTimestampDay,
              probability: 100,
              utcOffset: 0,
              surf: {
                min: 0,
                max: 0,
                optimalScore: 2,
                plus: false,
                humanRelation: "Chest to overhead",
                raw: {
                  min: 1.42,
                  max: 1.7,
                },
              },
              power: 794.86928,
            },
          ],
        },
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
