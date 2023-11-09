import { Rating, WaveTypeId } from "../types";
import UserNotificationSettingsCrudModel from "../user-notifications-settings.model";
import { findWaveConfigurationTypeById, getRatingByValue } from "../utils";
import { UserNotificationSettingsFactory } from "./user-notification-settings.factory";

describe("User Notification Settings", () => {
  describe("setPreferredWavHeight", () => {
    test("should set wave height for specific chat", async () => {
      //arrange
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      //act
      const chatId = 2;
      await UserNotificationSettingsCrudModel.setPreferredWavHeight(
        chatId,
        WaveTypeId.FAIR
      );

      //assert
      const result = await UserNotificationSettingsCrudModel.findOne({
        chatId,
      });
      const selectedWaveHight = findWaveConfigurationTypeById(WaveTypeId.FAIR);
      expect(result?.waveHeightRange.max).toBe(selectedWaveHight.height.max);
      expect(result?.waveHeightRange.min).toBe(selectedWaveHight.height.min);
      expect(result?.chatId).toBe(chatId);
    });

    test("should update wave height for specific chat", async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: findWaveConfigurationTypeById(WaveTypeId.POOR).height,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      //act
      await UserNotificationSettingsCrudModel.setPreferredWavHeight(
        chatId,
        WaveTypeId.POOR
      );

      //assert
      const result = await UserNotificationSettingsCrudModel.findOne({
        chatId,
      });

      const selectedWaveHight = findWaveConfigurationTypeById(WaveTypeId.POOR);
      expect(result?.waveHeightRange.max).toBe(selectedWaveHight.height.max);
      expect(result?.waveHeightRange.min).toBe(selectedWaveHight.height.min);
      expect(result?.chatId).toBe(chatId);
    });
    test("should failed updating wave height when wave height is invalid", async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: findWaveConfigurationTypeById(WaveTypeId.POOR).height,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      //assert
      expect(
        async () =>
          await UserNotificationSettingsCrudModel.setPreferredWavHeight(
            chatId,
            "invalid_wave_height" as any
          )
      ).rejects.toThrow("Invalid wave height");
    });
  });

  describe("set preferred rating", () => {
    test("should set rating for specific chat", async () => {
      //arrange
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
      });
      delete userNotificationSettings.rating;
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      //act
      const chatId = 2;
      const selectedRating = getRatingByValue(Rating.GOOD).key;
      await UserNotificationSettingsCrudModel.setPreferredRating(
        chatId,
        selectedRating
      );

      //assert
      const result = await UserNotificationSettingsCrudModel.findOne({
        chatId,
      });
      expect(result?.rating.key).toMatch(selectedRating);
      expect(result?.chatId).toBe(chatId);
    });

    test("should update rating for specific chat", async () => {
      //arrange
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId: 1,
        rating: getRatingByValue(Rating.POOR),
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      //act
      const chatId = 2;
      const selectedRating = getRatingByValue(Rating.GOOD).key;
      await UserNotificationSettingsCrudModel.setPreferredRating(
        chatId,
        selectedRating
      );

      //assert
      const result = await UserNotificationSettingsCrudModel.findOne({
        chatId,
      });
      expect(result?.rating.key).toMatch(selectedRating);
      expect(result?.chatId).toBe(chatId);
    });

    test("should failed updating rating when rating is invalid", async () => {
      //arrange
      const chatId = 2;
      const userNotificationSettings = UserNotificationSettingsFactory.build({
        chatId,
        waveHeightRange: findWaveConfigurationTypeById(WaveTypeId.POOR).height,
      });
      await UserNotificationSettingsCrudModel.create(userNotificationSettings);

      //assert
      expect(
        async () =>
          await UserNotificationSettingsCrudModel.setPreferredRating(
            chatId,
            "invalid_rating" as any
          )
      ).rejects.toThrow("Invalid rating");
    });
  });
});
