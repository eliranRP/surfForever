import BaseCrudModel from "../../framework/base.model";
import logger from "../../framework/logger.manager";
import { getForecast, spotDetails } from "../../surfline/api";
import { locationByName } from "../location/location.service";
import { SpotLocation } from "../location/location.types";
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

  private async enrichSpotDetailsById(spotId: string): Promise<SpotLocation> {
    const spot = await spotDetails(spotId);
    if (!spot?.spot?.name) {
      logger.error("Invalid spot id");
      throw new Error("Invalid spot id");
    }
    const enrichDetails = (await locationByName(spot.spot.name)).filter(
      (spot) => spot.spotId === spotId
    );
    if (enrichDetails.length == 0)
      throw new Error(`Location ${spot.spot.name} not found`);
    return enrichDetails[0];
  }

  async setPreferredLocation(chatId: number, spotId: string) {
    const spot = await this.enrichSpotDetailsById(spotId);
    if (!spot) throw new Error("Invalid location");
    return await this.upsert({ chatId }, { spot, chatId });
  }
}

export default new UserNotificationSettingsCrudModel();
