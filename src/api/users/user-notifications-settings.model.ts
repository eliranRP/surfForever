import BaseCrudModel from "../../framework/base.model";
import logger from "../../framework/logger.manager";
import { spotDetails } from "../../surfline/api";
import { searchSpotByName } from "../location/location.service";
import { SpotLocation } from "../location/location.types";
import { Hours, HoursKind, Rating, WaveTypeId } from "./types";
import UserNotificationSettings, {
  IUserNotificationSettingsSchema,
} from "./user-notifications-settings.schema";
import { findWaveConfigurationTypeById, getRatingByKey } from "./utils";

class UserNotificationSettingsCrudModel extends BaseCrudModel<IUserNotificationSettingsSchema> {
  constructor() {
    super(UserNotificationSettings);
  }

  async setPreferredHours(chatId: number, hoursKey: HoursKind) {
    const selectedHours = Hours[hoursKey].values;
    if (!selectedHours) throw new Error("Invalid hours");
    return await this.upsert(
      { chatId },
      { preferredReminderHours: selectedHours, chatId }
    );
  }

  async setPreferredRating(chatId: number, ratingKey: keyof typeof Rating) {
    const selectedRating = getRatingByKey(ratingKey);
    if (!selectedRating) throw new Error("Invalid rating");
    return await this.upsert(
      { chatId },
      {
        rating: selectedRating,
        chatId,
      }
    );
  }

  async setPreferredWavHeight(chatId: number, waveTypeId: WaveTypeId) {
    const selectedWaveHight = findWaveConfigurationTypeById(waveTypeId);
    return await this.upsert(
      { chatId },
      { waveHeightRange: selectedWaveHight.height, chatId }
    );
  }

  private async enrichSpotDetailsById(spotId: string): Promise<SpotLocation> {
    const spot = await spotDetails(spotId);
    if (!spot?.spot?.name) {
      logger.error("Invalid spot id");
      throw new Error("Invalid spot id");
    }
    const enrichDetails = (await searchSpotByName(spot.spot.name)).filter(
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
