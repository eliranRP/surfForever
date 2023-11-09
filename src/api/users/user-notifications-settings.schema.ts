import { Schema, Document, model } from "mongoose";
import { spotSchema } from "../location/location.schema";
import { SpotLocation } from "../location/location.types";
import { MORNING, Rating } from "./types";

export interface WaveHeightRange {
  min: number;
  max: number;
}

export interface RatingSchema {
  key: keyof typeof Rating;
  value: Rating;
}

export interface IUserNotificationSettings {
  waveHeightRange: WaveHeightRange;
  chatId: number;
  spot: SpotLocation;
  daysToForecast: number;
  preferredReminderHours: number[];
  rating: RatingSchema;
}

export type IUserNotificationSettingsSchema = IUserNotificationSettings &
  Document;

const UserNotificationSettingsSchema =
  new Schema<IUserNotificationSettingsSchema>(
    {
      waveHeightRange: {
        min: { type: Number },
        max: { type: Number },
      },
      spot: {
        type: spotSchema,
      },
      rating: {
        key: { type: String, enum: Object.keys(Rating) },
        value: { type: String, enum: Object.values(Rating).concat([null]) },
      },
      daysToForecast: { type: Number },
      preferredReminderHours: [{ type: Number, default: MORNING }],
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
