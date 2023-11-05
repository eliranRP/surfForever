import { Schema, Document, model } from "mongoose";
import { WaveHeightType } from "./const";
import { spotSchema } from "../location/location.schema";
import { SpotLocation } from "../location/location.types";

export interface IUserNotificationSettings {
  waveConfigurationId: WaveHeightType;
  chatId: number;
  spotName: string;
  spot: SpotLocation;
  daysToForecast: number;
  preferredReminderHours: number;
}

export type IUserNotificationSettingsSchema = IUserNotificationSettings &
  Document;

const UserNotificationSettingsSchema =
  new Schema<IUserNotificationSettingsSchema>(
    {
      waveConfigurationId: {
        type: String,
        enum: ["poor", "good", "high", "very_high"],
      },
      spot: {
        type: spotSchema,
      },
      spotName: { type: String },
      daysToForecast: { type: Number },
      preferredReminderHours: { type: Number, default: 20 },
      chatId: { type: Number },
    },
    { timestamps: true }
  );

UserNotificationSettingsSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  return obj;
};

const UserNotificationSettings = model<IUserNotificationSettingsSchema>(
  "UserNotificationSettings",
  UserNotificationSettingsSchema
);

export default UserNotificationSettings;
