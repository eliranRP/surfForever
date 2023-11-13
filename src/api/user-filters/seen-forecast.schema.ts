import { Schema, Document, model } from "mongoose";

export interface ISeenForecast {
  chatId: number;
  spotId: string;
  timestamp: number;
}

export type ISeenForecastSchema = ISeenForecast & Document;

const SeenForecastSchema = new Schema<ISeenForecastSchema>(
  {
    chatId: { type: Number },
    spotId: { type: String },
    timestamp: { type: Number },
  },
  { timestamps: true }
);

SeenForecastSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  return obj;
};

const SeenForecast = model<ISeenForecastSchema>(
  "seenForecast",
  SeenForecastSchema
);

export default SeenForecast;
