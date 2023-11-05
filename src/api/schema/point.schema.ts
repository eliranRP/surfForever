import mongoose from "mongoose";

export interface GeoPoint {
    type: "Point";
    coordinates: [number, number];
  }
  

export const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});
