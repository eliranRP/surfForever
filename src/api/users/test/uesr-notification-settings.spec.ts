import UserNotificationSettingsCrudModel from "../user-notifications-settings.model";
import { UserNotificationSettingsFactory } from "./user-notification-settings.factory";

describe("User Notification Settings", () => {
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
      "good"
    );

    //assert
    const result = await UserNotificationSettingsCrudModel.findOne({
      chatId,
    });

    expect(result?.waveConfigurationId).toMatch("good");
    expect(result?.chatId).toBe(chatId);
  });

  test("should update wave height for specific chat", async () => {
    //arrange
    const chatId = 2;
    const userNotificationSettings = UserNotificationSettingsFactory.build({
      chatId,
      waveConfigurationId: "poor",
    });
    await UserNotificationSettingsCrudModel.create(userNotificationSettings);

    //act
    await UserNotificationSettingsCrudModel.setPreferredWavHeight(
      chatId,
      "good"
    );

    //assert
    const result = await UserNotificationSettingsCrudModel.findOne({
      chatId,
    });

    expect(result?.waveConfigurationId).toBe("good");
    expect(result?.chatId).toBe(chatId);
  });
  test("should failed updating wave height when wave height is invalid", async () => {
    //arrange
    const chatId = 2;
    const userNotificationSettings = UserNotificationSettingsFactory.build({
      chatId,
      waveConfigurationId: "poor",
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
