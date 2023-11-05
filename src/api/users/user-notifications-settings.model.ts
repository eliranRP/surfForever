import BaseCrudModel from "../../framework/base.model";
import { WaveConfiguration, WaveHeightType } from "./const";
import UserNotificationSettings, {
  IUserNotificationSettingsSchema,
} from "./user-notifications-settings.schema";

class UserNotificationSettingsCrudModel extends BaseCrudModel<IUserNotificationSettingsSchema> {
  constructor() {
    super(UserNotificationSettings);
  }

  async setPreferredWavHeight(chatId: number, waveHeight: WaveHeightType) {
    const selectedWaveHight = WaveConfiguration.find(
      (option) => option.id === waveHeight
    );
    if (!waveHeight || !selectedWaveHight)
      throw new Error("Invalid wave height");

    return await this.upsert(
      { chatId },
      { waveConfigurationId: waveHeight, chatId }
    );
  }
}

export default new UserNotificationSettingsCrudModel();
