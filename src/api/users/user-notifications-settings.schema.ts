import { Schema, Document, model } from "mongoose";
import { pointSchema } from "../schema/point.schema";
import { GeoPoint } from "../schema/point.schema";
import { WaveHeightType } from "./const";

export interface IUserNotificationSettings {
  waveConfigurationId: WaveHeightType;
  chatId: number;
  beachName: string;
  location: GeoPoint;
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
      location: {
        type: pointSchema,
      },
      beachName: { type: String },
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
