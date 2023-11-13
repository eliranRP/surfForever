import dayjs from "dayjs";
import { AFTERNOON, MORNING, Rating } from "../../users/types";
import {
  checkMatchBetweenForecastAndUserSettings,
  matchUnseenForecasts,
  matchByDayHour as matchByHourDay,
  matchByRating,
  matchByWaveHeight,
} from "../user-filters";
import {
  ForecastFactory,
  SeenForecastFactory,
  WaveFactory,
} from "./user-filter.factory";
import { WaveHeightRange } from "../../users/user-notifications-settings.schema";
import { RatingResponse, WaveHeightResponse } from "../../../surfline/types";
import { getRatingByKey, getRatingByValue } from "../../users/utils";
import * as api from "../../../surfline/api";
import UserNotificationSettingsModel from "../../users/user-notifications-settings.model";
import { UserNotificationSettingsFactory } from "../../users/test/user-notification-settings.factory";
import { normalizeTimestamp } from "../utils";
import SeenForecastModel from "../seen-forecast.model";

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
      await UserNotificationSettingsModel.insert(userNotificationSettings);

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
      await UserNotificationSettingsModel.insert(userNotificationSettings);

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
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      // Act
      const result = await checkMatchBetweenForecastAndUserSettings(chatId);

      // Assert
      expect(result.length).toBe(0);
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
      await UserNotificationSettingsModel.insert(userNotificationSettings);

      // Act
      const result = await checkMatchBetweenForecastAndUserSettings(chatId);

      // Assert
      expect(result.length).toBe(0);
    });
  });

  describe("normalizeTimestamp", () => {
    test("should normalize timestamp - return the same date if it is in the same day", () => {
      //Arrange
      const date1 = dayjs("2023-11-08T09:00:00").unix();
      const date2 = dayjs("2023-11-08T12:00:00").unix();

      // Act
      const normalizeDate1 = normalizeTimestamp(date1);
      const normalizeDate2 = normalizeTimestamp(date2);

      //Assert
      expect(normalizeDate1).toEqual(dayjs("2023-11-08T00:00:00").unix());
      expect(normalizeDate2).toEqual(dayjs("2023-11-08T00:00:00").unix());
    });
  });

  describe("Unseen forecasts", () => {
    test("Should return that there are no unseen forecasts", async () => {
      //Arrange
      const chatId = 1;
      const spotId = "test";
      const timestamp1 = normalizeTimestamp(
        dayjs("2023-11-08T09:00:00").unix()
      );
      const timestamp2 = normalizeTimestamp(
        dayjs("2023-12-08T09:00:00").unix()
      );
      const seenForecast1 = SeenForecastFactory.build({
        chatId,
        spotId,
        timestamp: timestamp1,
      });

      const seenForecast2 = SeenForecastFactory.build({
        chatId,
        spotId,
        timestamp: timestamp2,
      });
      const seenForecasts = [seenForecast1, seenForecast2];

      await SeenForecastModel.insertMany(seenForecasts);

      const forecast1 = ForecastFactory.build({ timestamp: timestamp1 });
      const forecast2 = ForecastFactory.build({ timestamp: timestamp2 });
      const forecasts = [forecast1, forecast2];
      //Act
      const matches = await matchUnseenForecasts(forecasts, chatId, spotId);

      //Assert
      expect(matches.length).toBe(0);
    });
    test("Should return that there are no seen forecasts", async () => {
      //Arrange
      const chatId = 1;
      const spotId = "test";
      const timestamp1 = dayjs("2023-11-08T09:00:00").unix();
      const timestamp2 = dayjs("2023-12-08T09:00:00").unix();
      const seenForecast1 = SeenForecastFactory.build({
        chatId,
        spotId,
        timestamp: timestamp1,
      });

      const seenForecast2 = SeenForecastFactory.build({
        chatId,
        spotId,
        timestamp: timestamp2,
      });
      const seenForecasts = [seenForecast1, seenForecast2];

      await SeenForecastModel.insertMany(seenForecasts);

      const forecast1 = ForecastFactory.build({
        timestamp: dayjs(timestamp1).add(5, "hours").unix(),
      });
      const forecast2 = ForecastFactory.build({
        timestamp: dayjs(timestamp2).add(5, "hours").unix(),
      });
      const forecasts = [forecast1, forecast2];
      //Act
      const matches = await matchUnseenForecasts(forecasts, chatId, spotId);

      //Assert
      expect(matches.length).toBe(2);
    });
  });

  describe("Unseen forecasts", () => {
    test("When upsert unseen forecast with the same chatId, timestamp and spotId should update and not insert a new item", async () => {
      //Arrange
      const forecastTimestamp = dayjs("2023-11-08T09:00:00").unix();
      const forecasts = ForecastFactory.buildList(2, {
        timestamp: forecastTimestamp,
        wave: {
          min: 1,
          max: 2,
        },
        rating: {
          key: getRatingByKey("FAIR").key,
          value: getRatingByValue(Rating.FAIR).value,
        },
      });

      const chatId = 1;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
      });

      await SeenForecastModel.setSeenForecast(
        forecasts,
        chatId,
        userNotificationSettings.spot.spotId
      );

      const seenForecast = await SeenForecastModel.findMany({});
      expect(seenForecast.length).toBe(1);
    });
  });
});
