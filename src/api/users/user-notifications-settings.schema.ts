import { Schema, Document, model } from 'mongoose';
import { spotSchema } from '../location/location.schema';
import { SpotLocation } from '../location/location.types';
import { MORNING, Rating, WaveTypeId } from './types';
import { findWaveConfigurationTypeById, getRatingByValue } from './utils';

export interface WaveHeightRange {
  min: number;
  max: number;
}

export interface RatingSchema {
  key: keyof typeof Rating;
  value: Rating;
  display: string;
}

export interface IUserNotificationSettings {
  waveHeightRange: WaveHeightRange;
  chatId: number;
  spot: SpotLocation;
  daysToForecast: number;
  preferredReminderHours: number[];
  rating: RatingSchema;
  hasNotificationTurnedOn: boolean;
}

export type IUserNotificationSettingsSchema = IUserNotificationSettings & Document;

const UserNotificationSettingsSchema = new Schema<IUserNotificationSettingsSchema>(
  {
    waveHeightRange: {
      min: {
        type: Number,
        default: findWaveConfigurationTypeById(WaveTypeId.FAIR).height.min,
      },
      max: {
        type: Number,
        default: findWaveConfigurationTypeById(WaveTypeId.FAIR).height.max,
      },
    },
    spot: {
      type: spotSchema,
    },
    rating: {
      key: { type: String, default: getRatingByValue(Rating.FAIR).key },
      value: { type: Number, default: getRatingByValue(Rating.FAIR).value },
      display: { type: String },
    },
    daysToForecast: { type: Number, default: 2 },
    preferredReminderHours: { type: [Number], default: MORNING },
    chatId: { type: Number },
    hasNotificationTurnedOn: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

UserNotificationSettingsSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  return obj;
};

const UserNotificationSettings = model<IUserNotificationSettingsSchema>(
  'UserNotificationSettings',
  UserNotificationSettingsSchema,
);

export default UserNotificationSettings;
